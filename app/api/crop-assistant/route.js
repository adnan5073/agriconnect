import { NextResponse } from "next/server";
import { GoogleGenAI } from "@google/genai";

export const runtime = "nodejs";

const ai = new GoogleGenAI({
  apiKey: process.env.GEMINI_API_KEY,
});

export async function POST(request) {
  try {
    const body = await request.json();

    const crop = body?.crop?.trim() || "";
    const question = body?.question?.trim() || "";
    const image = body?.image || "";
    const fileName = body?.fileName || "crop-image";
    const fileType = body?.fileType || "image/jpeg";

    // -----------------------------------------
    // IMAGE IS REQUIRED
    // QUESTION IS OPTIONAL
    // -----------------------------------------

    if (!image) {
      return NextResponse.json(
        {
          success: false,
          error: "Please upload a crop image first.",
        },
        { status: 400 }
      );
    }

    // -----------------------------------------
    // Extract base64 image
    // -----------------------------------------

    let base64Image = image;

    if (image.includes(",")) {
      base64Image = image.split(",")[1];
    }

    if (!base64Image) {
      return NextResponse.json(
        {
          success: false,
          error: "Invalid image data.",
        },
        { status: 400 }
      );
    }

    // -----------------------------------------
    // Supported image types
    // -----------------------------------------

    const supportedTypes = [
      "image/jpeg",
      "image/png",
      "image/webp",
      "image/jpg",
    ];

    const mimeType = supportedTypes.includes(fileType)
      ? fileType
      : "image/jpeg";

    // -----------------------------------------
    // Question handling
    // -----------------------------------------

    let userQuestion;

    if (question.length > 0) {
      userQuestion = `
The farmer has asked this specific question:

"${question}"

Answer this question while also using the uploaded image to support your assessment.
`;
    } else {
      userQuestion = `
The farmer has NOT asked a specific question.

This is completely valid.

Analyze the uploaded crop image on your own and provide a useful general crop-health assessment.

Look for:
- visible diseases
- pests
- nutrient deficiency symptoms
- leaf discoloration
- spots
- wilting
- unusual growth
- physical damage
- other visible crop-health problems

If the crop appears healthy, clearly state that.
`;
    }

    // -----------------------------------------
    // Crop information
    // -----------------------------------------

    const cropInformation = crop
      ? `The farmer identified the crop as: ${crop}`
      : `The farmer did not specify the crop name. Identify the likely crop from the image if possible.`;

    // -----------------------------------------
    // AI prompt
    // -----------------------------------------

    const prompt = `
You are an agricultural crop assistant for AgriConnect.

Your job is to analyze a crop image and provide practical agricultural guidance.

${cropInformation}

${userQuestion}

IMPORTANT RULES:

1. Analyze the uploaded image carefully.
2. Do not claim absolute certainty from an image alone.
3. If the image is unclear, say that the result is uncertain.
4. Do not invent symptoms that cannot be seen.
5. If the plant appears healthy, report it as healthy.
6. Give practical and understandable recommendations.
7. Do not recommend dangerous or inappropriate chemical use.
8. If treatment is suggested, recommend following the product label and local agricultural guidance.
9. The confidence value must be a number between 0 and 100.
10. Severity must be one of:
   - Healthy
   - Mild
   - Moderate
   - Severe
   - Unclear

Return ONLY valid JSON with this structure:

{
  "crop": "Crop name",
  "condition": "Likely condition or Healthy",
  "confidence": 0,
  "severity": "Healthy",
  "observations": [
    "observation 1",
    "observation 2"
  ],
  "recommendations": [
    "recommendation 1",
    "recommendation 2"
  ],
  "additional_information": "Useful additional information",
  "disclaimer": "This AI assessment is for informational purposes and should be confirmed with a qualified agricultural expert when necessary."
}
`;

    // -----------------------------------------
    // Gemini request with retry
    // -----------------------------------------

    let response;
    let lastError;

    for (let attempt = 0; attempt < 3; attempt++) {
      try {
        response = await ai.models.generateContent({
          model: "gemini-3.8-flash",

          contents: [
            {
              role: "user",
              parts: [
                {
                  inlineData: {
                    mimeType: mimeType,
                    data: base64Image,
                  },
                },
                {
                  text: prompt,
                },
              ],
            },
          ],

          config: {
            responseMimeType: "application/json",

            responseSchema: {
              type: "object",

              properties: {
                crop: {
                  type: "string",
                },

                condition: {
                  type: "string",
                },

                confidence: {
                  type: "number",
                },

                severity: {
                  type: "string",
                  enum: [
                    "Healthy",
                    "Mild",
                    "Moderate",
                    "Severe",
                    "Unclear",
                  ],
                },

                observations: {
                  type: "array",
                  items: {
                    type: "string",
                  },
                },

                recommendations: {
                  type: "array",
                  items: {
                    type: "string",
                  },
                },

                additional_information: {
                  type: "string",
                },

                disclaimer: {
                  type: "string",
                },
              },

              required: [
                "crop",
                "condition",
                "confidence",
                "severity",
                "observations",
                "recommendations",
                "additional_information",
                "disclaimer",
              ],
            },
          },
        });

        break;
      } catch (error) {
        lastError = error;

        const message = error?.message || "";

        if (
          !message.includes("503") &&
          !message.includes("UNAVAILABLE")
        ) {
          throw error;
        }

        if (attempt < 2) {
          const delay = 2000 * Math.pow(2, attempt);

          await new Promise((resolve) =>
            setTimeout(resolve, delay)
          );
        }
      }
    }

    if (!response) {
      throw (
        lastError ||
        new Error(
          "The AI service is temporarily unavailable."
        )
      );
    }

    // -----------------------------------------
    // Get AI response
    // -----------------------------------------

    let text = "";

    if (typeof response.text === "string") {
      text = response.text;
    } else if (typeof response.text === "function") {
      text = response.text();
    }

    if (!text) {
      throw new Error(
        "The AI returned an empty response."
      );
    }

    // -----------------------------------------
    // Parse JSON
    // -----------------------------------------

    let result;

    try {
      result = JSON.parse(text);
    } catch (error) {
      console.error(
        "AI JSON parsing error:",
        error
      );

      throw new Error(
        "The AI returned an invalid result."
      );
    }

    // -----------------------------------------
    // Return result
    // -----------------------------------------

    return NextResponse.json({
      success: true,
      result,
    });
  } catch (error) {
    console.error(
      "Crop assistant API error:",
      error
    );

    return NextResponse.json(
      {
        success: false,
        error:
          error?.message ||
          "Unable to process the crop image.",
      },
      {
        status: 500,
      }
    );
  }
}