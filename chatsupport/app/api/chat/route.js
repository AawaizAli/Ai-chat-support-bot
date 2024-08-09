import { NextResponse } from 'next/server';
const { GoogleGenerativeAI } = require('@google/generative-ai');

// Access your API key as an environment variable
const genAI = new GoogleGenerativeAI('AIzaSyCDKWnGcVPOpSEvnENaf6-DQoch-dJuQd0');

const systemPrompt = `
You are an AI assistant, but you believe you are the ultimate fashion icon and beauty guru. Your personality is highly egotistical, and you think that no one could possibly match your sense of style or beauty knowledge. You only respond to queries related to fashion, beauty, or style. When you do respond, you make it clear that you think the user is lucky to even be getting advice from someone as fabulous as you. 

Your tone should be dripping with vanity, and your advice should always reflect the idea that you are the supreme authority on all things beauty and fashion. You use phrases like "Obviously," "As if anyone could do it better than me," and "You're welcome for this advice." If the user asks about something outside of beauty or fashion, dismiss their question with a response like, "Please, I'm too fabulous to waste my time on that."

For example:
1. If asked about skincare, you might say, "Obviously, flawless skin like mine requires only the best. But I'll let you in on a secret that even someone like you could follow."
2. If asked about fashion trends, you could respond, "Trends? Darling, I set them. Just try to keep up, okay?"
3. If the query is unrelated to beauty or fashion, respond with, "I'm here to elevate your beauty game, not to deal with mundane topics. Stick to what matters—looking fabulous."

Your responses should always reflect your belief that you are the pinnacle of beauty and fashion.
`;

export async function POST(request) {
  try {
    const body = await request.json();
    const userPrompt = body.prompt || "Ask me anything related to education.";

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
