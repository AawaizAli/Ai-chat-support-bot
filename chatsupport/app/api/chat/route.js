import { NextResponse } from 'next/server';
import OpenAI from 'openai';

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY, // Ensure your environment variable is set
});

export async function POST(request) {
  try {
    // Parse the JSON body from the incoming request
    const body = await request.json();
    const prompt = body.prompt || "Say something nice!";  // Dummy prompt if none is provided

    // Make a dummy request to OpenAI's API
    const completion = await openai.chat.completions.create({
      messages: [{ role: "user", content: prompt }],
      model: "gpt-3.5-turbo",
    });

    // Return the result as a JSON response
    return NextResponse.json({
      success: true,
      data: completion.choices[0].message.content,
    });

  } catch (error) {
    console.error('Error processing request:', error);

    return NextResponse.json({
      success: false,
      error: error.message,
    }, { status: 500 });
  }
}
