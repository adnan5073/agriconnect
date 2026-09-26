import { NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';

export async function POST(req) {
  try {
    const { imageBase64 } = await req.json();

    if (!imageBase64) {
      return NextResponse.json({ error: 'Image data is required.' }, { status: 400 });
    }

    // Call Google Gemini API
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
                  text: 'You are an agricultural plant pathologist expert. Analyze this crop leaf image and output raw JSON (without markdown or backticks) containing: "possible_issue" (string title), "confidence" (percentage string), "symptoms" (array of strings), and "recommended_next_steps" (array of actionable step strings).'
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

    if (!data.candidates || !data.candidates[0].content) {
      throw new Error('Invalid response structure from AI model.');
    }

    const rawText = data.candidates[0].content.parts[0].text;
    const cleanJson = JSON.parse(rawText.replace(/```json|```/g, '').trim());

    // Optional: Log diagnostic scan entry to Supabase
    await supabase.from('crop_scans').insert([
      {
        detected_issue: cleanJson.possible_issue,
        confidence: cleanJson.confidence,
        symptoms: cleanJson.symptoms,
        recommendations: cleanJson.recommended_next_steps
      }
    ]);

    return NextResponse.json(cleanJson);
  } catch (error) {
    console.error('Crop assistant API error:', error);
    return NextResponse.json(
      { error: 'Failed to process and diagnose the crop image.' }, 
      { status: 500 }
    );
  }
}