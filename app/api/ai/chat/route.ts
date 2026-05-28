import { google } from "@ai-sdk/google";
import { generateText } from "ai";
import { NextResponse } from "next/server";

export const maxDuration = 30; // Maximum duration for serverless execution

export async function POST(req: Request) {
  // 5. Use GOOGLE_GENERATIVE_AI_API_KEY environment variable
  const apiKey = process.env.GOOGLE_GENERATIVE_AI_API_KEY;

  // 6. Validation: If API key is missing → return 500
  if (!apiKey) {
    console.error("AI Chat API Error: GOOGLE_GENERATIVE_AI_API_KEY is not set in environment variables.");
    return NextResponse.json(
      { 
        success: false, 
        error: "Google Generative AI API Key is missing on the server. Please check your environment variables." 
      },
      { status: 500 }
    );
  }

  try {
    let body;
    try {
      body = await req.json();
    } catch (parseError) {
      console.error("AI Chat API Error: Failed to parse request JSON body.", parseError);
      return NextResponse.json(
        { success: false, error: "Invalid JSON format in request body." },
        { status: 400 }
      );
    }

    const { messages, message } = body;
    let finalMessages = messages;

    // Backward compatibility: wrap singular message string in an array
    if (!finalMessages && message && typeof message === "string") {
      finalMessages = [{ role: "user", content: message }];
    }

    // 6. Validation: If no messages array → return 400
    if (!finalMessages || !Array.isArray(finalMessages) || finalMessages.length === 0) {
      console.warn("AI Chat API Warning: Validation failed - Empty or missing 'messages' array.");
      return NextResponse.json(
        { success: false, error: "Missing or invalid 'messages' array in request body." },
        { status: 400 }
      );
    }

    // Extract latest user message
    const latestUserMessage = finalMessages[finalMessages.length - 1];
    if (!latestUserMessage || !latestUserMessage.content || latestUserMessage.content.trim() === "") {
      console.warn("AI Chat API Warning: Validation failed - Latest user message content is empty.");
      return NextResponse.json(
        { success: false, error: "The latest user message content cannot be empty." },
        { status: 400 }
      );
    }

    // 10. Fix warning: "System messages in prompt can be security risk"
    // We clean the messages array by filtering out any system messages
    const cleanMessages = finalMessages.filter((msg: any) => msg && msg.role !== "system");

    // Add timeout safety (15 seconds timeout)
    const timeoutDuration = 15000;
    const timeoutPromise = new Promise<never>((_, reject) =>
      setTimeout(() => reject(new Error("Timeout")), timeoutDuration)
    );

    let responseText = "";
    let isFallback = false;
    let modelUsed = "gemini-2.0-flash";

    let usage = { inputTokens: 0, outputTokens: 0 };

    try {
      // Race Gemini API call against the timeout promise
      const result = await Promise.race([
        generateText({
          model: google("gemini-2.0-flash"),
          messages: cleanMessages,
          // Set system prompt explicitly using the system option (fixing security risk warnings)
          system: "You are VYRON AI, a production-ready AI Copilot built into the VYRON AI SaaS platform. " +
                  "You help the user with coding, explanations, brainstorming, debugging, content generation, and utilizing SaaS tools. " +
                  "Be extremely professional, concise, helpful, and use GitHub Flavored Markdown for all responses.",
          temperature: 0.4,
        }),
        timeoutPromise
      ]);

      responseText = result.text;
      usage = {
        inputTokens: result.usage?.inputTokens || 0,
        outputTokens: result.usage?.outputTokens || 0,
      };
    } catch (apiError: any) {
      // 7. Add fallback AI response if Gemini fails (e.g., rate limit, network down, timeout, etc.)
      isFallback = true;
      modelUsed = "offline-fallback";
      
      // Add console error logging
      console.error(
        `AI Chat API Warning: Gemini API call failed or timed out. Triggering premium fallback response. Details:`,
        apiError
      );

      const lastMsg = cleanMessages[cleanMessages.length - 1]?.content || "";
      const query = lastMsg.toLowerCase();
      
      let dynamicReply = "";
      if (query.includes("hi") || query.includes("hello") || query.includes("hey")) {
        dynamicReply = "Hello! I am your **VYRON AI Copilot**, your advanced business assistant. I'm here to help you optimize workflows, automate lead pipelines, track finances, and scale your operations. What would you like to build or analyze today?";
      } else if (query.includes("saas") || query.includes("landing") || query.includes("page")) {
        dynamicReply = "Building a premium SaaS landing page requires a robust structure. Here is the recommended blueprint for **VYRON AI**:\n\n" +
                       "### 1. Hero Section\n" +
                       "- **Modern Typography**: Use bold headers (e.g., 'Inter' or 'Outfit') with a vibrant text gradient.\n" +
                       "- **Glassmorphic Card**: A floating interactive mock UI that showcases your product in action.\n" +
                       "- **Sleek CTA**: A rounded 'Get Started' button with subtle hover scale micro-animations.\n\n" +
                       "### 2. Core Features Grid\n" +
                       "- **AI Pipeline CRM**: Real-time pipeline health tracking.\n" +
                       "- **Finance & GST Tracker**: Automated invoice generation and GST compliance check.\n" +
                       "- **Global AI Copilot**: Premium floating chatbot panel.\n\n" +
                       "### 3. Pricing Matrix\n" +
                       "- Standard 3-column cards: Starter (Free), Growth ($49/mo), and Pro ($99/mo) with active billing toggles.";
      } else if (query.includes("typescript") || query.includes("error") || query.includes("compil")) {
        dynamicReply = "To resolve typical TypeScript compilation warnings in your React/Next.js application, implement these best practices:\n\n" +
                       "### 1. Declare Optional Props\n" +
                       "Ensure all optional component inputs are properly typed using `?:` in interface declarations:\n" +
                       "```typescript\n" +
                       "interface ButtonProps {\n" +
                       "  label: string;\n" +
                       "  onClick?: () => void;\n" +
                       "}\n" +
                       "```\n\n" +
                       "### 2. Custom Module Declarations\n" +
                       "If an npm package lacks TypeScript support, create a declaration file under `types/` (e.g., `types/react-syntax-highlighter.d.ts`):\n" +
                       "```typescript\n" +
                       "declare module 'react-syntax-highlighter';\n" +
                       "```\n\n" +
                       "### 3. Proper Return Types\n" +
                       "Explicitly type your API routes and hook return values to avoid implicit `any` errors.";
      } else {
        dynamicReply = `That is a great question! Scaling a business with **VYRON AI** involves automating repetitive tasks and leveraging structured data. Here's how you can optimize this flow:\n\n` +
                       `1. **Lead Automation**: Connect your marketing campaigns to feed directly into the CRM pipeline.\n` +
                       `2. **Financial Tracking**: Use our GST invoicing suite to automatically track incoming transactions.\n` +
                       `3. **Analytics**: Review the monthly reports dashboard to analyze trends and high-performing lead sources.\n\n` +
                       `Let me know if you would like me to draft a specific implementation plan or code snippet for this!`;
      }
      responseText = dynamicReply;
    }

    // Return production-ready JSON response
    return NextResponse.json({
      success: true,
      text: responseText,
      model: modelUsed,
      fallback: isFallback,
      usage: !isFallback ? usage : undefined,
      timestamp: new Date().toISOString(),
    });

  } catch (error: any) {
    // Add global console error logging
    console.error("AI Chat API Route: Critical Global Error:", error);
    return NextResponse.json(
      { 
        success: false, 
        error: "A critical unexpected error occurred on the server.", 
        details: error?.message || String(error) 
      },
      { status: 500 }
    );
  }
}
