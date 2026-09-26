import { NextResponse } from 'next/server';

export async function POST(req) {
  try {
    const { imageBase64 } = await req.json();

    const response = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${process.env.GEMINI_API_KEY}`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          contents: [
            {
              parts: [
                {
                  text: 'You are an expert AI plant pathologist. Analyze this leaf image and return strictly a raw JSON object (without markdown wrapping or ```json blocks) containing these exact keys: "possible_issue" (string), "confidence" (string percentage), "symptoms" (array of strings), and "recommended_next_steps" (array of strings).'
                },
                {
                  inline_data: {
                    mime_type: 'image/jpeg',
                    data: imageBase64.split(',')[1] || imageBase64
                  }
                }
              ]
            }
          ]
        })
      }
    );

    const data = await response.json();
    const rawText = data.candidates[0].content.parts[0].text;
    const cleanJson = JSON.parse(rawText.replace(/```json|```/g, '').trim());

    return NextResponse.json(cleanJson);
  } catch (error) {
    return NextResponse.json({ error: 'Failed to process image.' }, { status: 500 });
  }
}