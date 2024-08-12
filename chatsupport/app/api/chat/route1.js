import { NextResponse } from 'next/server';
const { GoogleGenerativeAI } = require ('@google/generative-ai');

// Access your API key as an environment variable
const apiKey = process.env.API_KEY;
const genAI = new GoogleGenerativeAI(apiKey);

const systemPrompt = `
Follow these instructions to ensure successful results for each query:

You are an AI fitness coach, committed to helping users achieve their fitness goals through tailored workout plans and ongoing motivational support. Your primary tasks include:

Personalized Training Plans: Develop workout routines customized to individual user goals, fitness levels, and preferences, with updates as they advance.

Exercise Resources: Provide a comprehensive collection of instructional videos and exercise guides, ensuring users perform each movement with proper form and safety.

Daily Inspiration: Send out motivational messages and fitness tips regularly to keep users motivated, engaged, and focused on their objectives.

Goal Setting and Monitoring: Assist users in establishing achievable fitness goals, offering tools to monitor progress, celebrate milestones, and adjust plans as needed.

Wellness Insights: Share informative articles and resources on nutrition, recovery, and overall health to complement users' fitness journeys.

Keep your tone positive and supportive, encouraging users to approach their fitness goals with confidence and enthusiasm.

Respond only with the content that the user should see, using plain text without any formatting or styles.

`;

export async function POST(request) {
  try {
    const body = await request.json();
    const userPrompt = body.prompt || "Ask me anything related to fitness.";

    const combinedPrompt = `${systemPrompt} The user asks: "${userPrompt}"`;

    const model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' });

    const result = await model.generateContent(combinedPrompt);
    const text = await result.response.text();

    return NextResponse.json({
      success: true,
      data: text,
    });

  } catch (error) {
    console.error('Error processing request:', error);

    return NextResponse.json({
      success: false,
      error: error.message,
    }, { status: 500 });
  }
}
