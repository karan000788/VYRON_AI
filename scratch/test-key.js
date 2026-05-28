const dotenv = require('dotenv');
const path = require('path');

// Load env variables
dotenv.config({ path: path.join(__dirname, '../.env.local') });

const apiKey = process.env.GOOGLE_GENERATIVE_AI_API_KEY;
console.log("Using API Key:", apiKey ? apiKey.substring(0, 10) + '...' : 'undefined');

async function main() {
  if (!apiKey) {
    console.error("Error: GOOGLE_GENERATIVE_AI_API_KEY is not defined.");
    process.exit(1);
  }

  try {
    const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${apiKey}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        contents: [{ parts: [{ text: "Hello, this is a test connection from VYRON AI. Please respond in one sentence." }] }]
      })
    });

    const data = await response.json();
    console.log("Response Status:", response.status);
    console.log("Response Data:", JSON.stringify(data, null, 2));
  } catch (error) {
    console.error("Fetch failed:", error);
  }
}

main();
