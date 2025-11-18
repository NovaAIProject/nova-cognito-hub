import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { message, model = "google/gemini-2.5-flash", generateImage = false, chatId } = await req.json();

    if (!message) {
      throw new Error("Message is required");
    }

    // Initialize Supabase client to fetch conversation history
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_ANON_KEY') ?? '',
      {
        global: {
          headers: { Authorization: req.headers.get('Authorization')! },
        },
      }
    );

    // Fetch conversation history if chatId is provided - get last 20 messages for better memory
    let conversationHistory: any[] = [];
    if (chatId) {
      const { data: messages, error } = await supabaseClient
        .from('messages')
        .select('role, content, model')
        .eq('chat_id', chatId)
        .order('created_at', { ascending: true })
        .limit(20); // Limit to last 20 messages for optimal performance

      if (!error && messages) {
        conversationHistory = messages.map(msg => ({
          role: msg.role,
          content: msg.content.replace(/\n\n_Response time: \d+s_$/, '') // Remove response time from content
        }));
      }
    }

    // Handle Claude models separately
    if (model.startsWith("claude")) {
      const ANTHROPIC_API_KEY = Deno.env.get("ANTHROPIC_API_KEY");
      if (!ANTHROPIC_API_KEY) {
        throw new Error("ANTHROPIC_API_KEY is not configured");
      }

      const anthropicResponse = await fetch("https://api.anthropic.com/v1/messages", {
        method: "POST",
        headers: {
          "x-api-key": ANTHROPIC_API_KEY,
          "anthropic-version": "2023-06-01",
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          model: model,
          max_tokens: 4096,
          messages: conversationHistory.length > 0 
            ? [...conversationHistory, { role: "user", content: message }]
            : [{ role: "user", content: message }],
          system: "You are Nova AI, a helpful and intelligent assistant. Provide clear, concise, and helpful responses. When writing code, always use proper markdown code blocks with language specifications.",
        }),
      });

      if (!anthropicResponse.ok) {
        const errorText = await anthropicResponse.text();
        console.error("Anthropic API error:", anthropicResponse.status, errorText);
        throw new Error(`Anthropic API error: ${anthropicResponse.status}`);
      }

      const anthropicData = await anthropicResponse.json();
      const aiResponse = anthropicData.content?.[0]?.text;

      if (!aiResponse) {
        throw new Error("No response from Claude");
      }

      return new Response(
        JSON.stringify({ response: aiResponse }),
        {
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        }
      );
    }

    // Handle Lovable AI models (Gemini, GPT)
    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    if (!LOVABLE_API_KEY) {
      throw new Error("LOVABLE_API_KEY is not configured");
    }

    const systemMessage = {
      role: "system",
      content: generateImage 
        ? "You are Nova AI. Generate images based on user descriptions."
        : "You are Nova AI, a highly intelligent and helpful assistant. You have access to the full conversation history and should reference previous messages when relevant. Provide clear, accurate, and contextual responses. When writing code, always use proper markdown code blocks with language specifications. Be concise but thorough.",
    };

    const requestBody: any = {
      model: generateImage ? "google/gemini-2.5-flash-image-preview" : model,
      messages: conversationHistory.length > 0
        ? [systemMessage, ...conversationHistory, { role: "user", content: message }]
        : [systemMessage, { role: "user", content: message }],
    };

    if (generateImage) {
      requestBody.modalities = ["image", "text"];
    }

    const response = await fetch(
      "https://ai.gateway.lovable.dev/v1/chat/completions",
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${LOVABLE_API_KEY}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify(requestBody),
      }
    );

    if (!response.ok) {
      const errorText = await response.text();
      console.error("AI gateway error:", response.status, errorText);
      
      if (response.status === 429) {
        return new Response(
          JSON.stringify({
            error: "Rate limit exceeded. Please try again later.",
          }),
          {
            status: 429,
            headers: { ...corsHeaders, "Content-Type": "application/json" },
          }
        );
      }

      if (response.status === 402) {
        return new Response(
          JSON.stringify({
            error: "Payment required. Please add credits to continue.",
          }),
          {
            status: 402,
            headers: { ...corsHeaders, "Content-Type": "application/json" },
          }
        );
      }

      throw new Error(`AI gateway error: ${response.status}`);
    }

    const data = await response.json();
    const aiResponse = data.choices?.[0]?.message?.content;
    const images = data.choices?.[0]?.message?.images;

    if (!aiResponse && !images) {
      throw new Error("No response from AI");
    }

    return new Response(
      JSON.stringify({ 
        response: aiResponse || "Image generated successfully",
        images: images 
      }),
      {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  } catch (error) {
    console.error("Chat function error:", error);
    const errorMessage = error instanceof Error ? error.message : "Internal server error";
    return new Response(
      JSON.stringify({ error: errorMessage }),
      {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  }
});
