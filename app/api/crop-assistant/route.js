import { NextResponse } from "next/server";
import { GoogleGenAI } from "@google/genai";

export const runtime = "nodejs";

const ai = new GoogleGenAI({
  apiKey: process.env.GEMINI_API_KEY,
});

export async function POST(request) {
  try {
    // -----------------------------------------
    // Read request
    // -----------------------------------------

    let body;

    try {
      body = await request.json();
    } catch {
      return NextResponse.json(
        {
          success: false,
          error:
            "Invalid request data. Please try again.",
        },
        { status: 400 }
      );
    }

    const crop =
      typeof body?.crop === "string"
        ? body.crop.trim()
        : "";

    const question =
      typeof body?.question === "string"
        ? body.question.trim()
        : "";

    const image =
      typeof body?.image === "string"
        ? body.image
        : "";

    const fileName =
      body?.fileName || "crop-image";

    const fileType =
      body?.fileType || "image/jpeg";

    // -----------------------------------------
    // Image is mandatory
    // Question is optional
    // -----------------------------------------

    if (!image) {
      return NextResponse.json(
        {
          success: false,
          error:
            "Please upload a crop image first.",
          code: "IMAGE_REQUIRED",
        },
        { status: 400 }
      );
    }

    // -----------------------------------------
    // Extract base64
    // -----------------------------------------

    let base64Image = image;

    if (image.includes(",")) {
      base64Image = image.split(",")[1];
    }

    if (!base64Image) {
      return NextResponse.json(
        {
          success: false,
          error:
            "The uploaded image is invalid or empty.",
          code: "INVALID_IMAGE",
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

    const mimeType =
      supportedTypes.includes(fileType)
        ? fileType
        : "image/jpeg";

    // -----------------------------------------
    // Question handling
    // -----------------------------------------

    let userQuestion;

    if (question) {
      userQuestion = `
The farmer has asked this specific question:

"${question}"

Answer the farmer's question using the uploaded crop image.
`;
    } else {
      userQuestion = `
The farmer has not asked a specific question.

This is completely valid.

Perform a general crop-health assessment using the uploaded image.

Look for visible:
- diseases
- pests
- nutrient deficiency symptoms
- leaf discoloration
- spots
- wilting
- unusual growth
- physical damage
- other visible crop-health problems

If the crop appears healthy, clearly report that.
`;
    }

    // -----------------------------------------
    // Crop information
    // -----------------------------------------

    const cropInformation = crop
      ? `
The farmer identified the crop as:
${crop}
`
      : `
The farmer did not specify the crop name.
Try to identify the crop from the image if possible.
If the crop cannot be identified confidently, say so.
`;

    // -----------------------------------------
    // Gemini prompt
    // -----------------------------------------

    const prompt = `
You are an agricultural crop assistant for AgriConnect.

Your job is to analyze an uploaded crop or plant image and provide useful agricultural guidance.

${cropInformation}

${userQuestion}

IMAGE VALIDATION IS IMPORTANT.

First determine whether the uploaded image is suitable for agricultural crop analysis.

The image should contain a recognizable:
- crop
- plant
- leaf
- stem
- fruit
- flower
- or other clearly visible plant part.

If the image contains:
- a person
- animal
- vehicle
- building
- random object
- document
- screenshot
- completely unrelated scene
- no recognizable plant

then do NOT invent a crop disease diagnosis.

Instead return:

condition: "No suitable crop detected"

severity: "Unclear"

confidence: a low value

and explain in observations that the user should upload a clear crop or plant image.

Also check whether the plant is sufficiently visible.

If the plant is:
- too far away
- heavily obstructed
- extremely blurry
- extremely dark
- overexposed
- too small in the image
- unclear

then do not make a confident disease diagnosis.

Return an uncertain result and recommend taking a clearer close-up image.

IMPORTANT:

Do not claim absolute certainty from an image alone.

Do not invent symptoms.

Do not invent a disease when there is insufficient visual evidence.

If the crop appears healthy, clearly report that.

Give practical and understandable recommendations.

If treatment is suggested, advise the farmer to follow product labels and local agricultural guidance.

Do not recommend unsafe chemical use.

Confidence must be a number between 0 and 100.

Severity must be exactly one of:

Healthy
Mild
Moderate
Severe
Unclear

Return ONLY valid JSON.

Use exactly this structure:

{
  "crop": "Crop name or Unknown",
  "condition": "Likely condition, Healthy, or No suitable crop detected",
  "confidence": 0,
  "severity": "Unclear",
  "observations": [
    "observation 1",
    "observation 2"
  ],
  "recommendations": [
    "recommendation 1",
    "recommendation 2"
  ],
  "additional_information": "Useful additional information",
  "disclaimer": "This AI assessment is for informational purposes only and should be confirmed with a qualified agricultural expert when necessary."
}
`;

    // -----------------------------------------
    // Gemini request with retry
    // -----------------------------------------

    let response;
    let lastError;

    for (let attempt = 0; attempt < 3; attempt++) {
      try {
        response =
          await ai.models.generateContent({
            model: "gemini-3.8-flash",

            contents: [
              {
                role: "user",

                parts: [
                  {
                    inlineData: {
                      mimeType,
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
              responseMimeType:
                "application/json",

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

        const message =
          error?.message || "";

        console.error(
          `Gemini attempt ${
            attempt + 1
          } failed:`,
          error
        );

        // Retry temporary Gemini overload
        if (
          message.includes("503") ||
          message.includes(
            "UNAVAILABLE"
          ) ||
          message.includes(
            "high demand"
          )
        ) {
          if (attempt < 2) {
            const delay =
              2000 *
              Math.pow(2, attempt);

            await new Promise(
              (resolve) =>
                setTimeout(
                  resolve,
                  delay
                )
            );

            continue;
          }
        }

        throw error;
      }
    }

    // -----------------------------------------
    // No response
    // -----------------------------------------

    if (!response) {
      throw (
        lastError ||
        new Error(
          "The AI service did not return a response."
        )
      );
    }

    // -----------------------------------------
    // Get response text
    // -----------------------------------------

    let text = "";

    if (
      typeof response.text ===
      "string"
    ) {
      text = response.text;
    } else if (
      typeof response.text ===
      "function"
    ) {
      text = response.text();
    }

    if (!text) {
      throw new Error(
        "The AI returned an empty response. Please try again."
      );
    }

    // -----------------------------------------
    // Parse AI JSON
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
        "The AI returned an invalid result. Please try again."
      );
    }

    // -----------------------------------------
    // Validate AI result
    // -----------------------------------------

    if (
      !result ||
      typeof result !== "object"
    ) {
      throw new Error(
        "The AI returned an invalid assessment."
      );
    }

    if (
      !result.condition ||
      !result.severity
    ) {
      throw new Error(
        "The AI could not produce a complete crop assessment."
      );
    }

    // -----------------------------------------
    // Normalize confidence
    // -----------------------------------------

    let confidence = Number(
      result.confidence
    );

    if (Number.isNaN(confidence)) {
      confidence = 0;
    }

    confidence = Math.max(
      0,
      Math.min(100, confidence)
    );

    result.confidence = Math.round(
      confidence
    );

    // -----------------------------------------
    // Normalize arrays
    // -----------------------------------------

    if (
      !Array.isArray(
        result.observations
      )
    ) {
      result.observations = [];
    }

    if (
      !Array.isArray(
        result.recommendations
      )
    ) {
      result.recommendations = [];
    }

    // -----------------------------------------
    // Return successful result
    // -----------------------------------------

    return NextResponse.json({
      success: true,
      result,
      fileName,
    });
  } catch (error) {
    console.error(
      "Crop Assistant API Error:",
      error
    );

    const message =
      error?.message || "";

    // -----------------------------------------
    // Gemini overload
    // -----------------------------------------

    if (
      message.includes("503") ||
      message.includes(
        "UNAVAILABLE"
      ) ||
      message.includes(
        "high demand"
      )
    ) {
      return NextResponse.json(
        {
          success: false,
          error:
            "The AI service is temporarily busy. Please wait a few seconds and try again.",
          code: "AI_BUSY",
        },
        { status: 503 }
      );
    }

    // -----------------------------------------
    // API key problems
    // -----------------------------------------

    if (
      message
        .toLowerCase()
        .includes("api key")
    ) {
      return NextResponse.json(
        {
          success: false,
          error:
            "The AI service is not configured correctly. Please check the server configuration.",
          code: "AI_CONFIGURATION_ERROR",
        },
        { status: 500 }
      );
    }

    // -----------------------------------------
    // Generic error
    // -----------------------------------------

    return NextResponse.json(
      {
        success: false,
        error:
          message ||
          "Unable to process the crop image. Please try again.",
        code: "AI_ERROR",
      },
      { status: 500 }
    );
  }
}