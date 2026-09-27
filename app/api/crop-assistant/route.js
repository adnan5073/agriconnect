import { NextResponse } from "next/server";
import { GoogleGenAI } from "@google/genai";

export const runtime = "nodejs";

const MODEL = "gemini-3.8-flash";

const apiKey = process.env.GEMINI_API_KEY;

const ai = apiKey
  ? new GoogleGenAI({
      apiKey,
    })
  : null;

export async function POST(request) {
  try {
    // -----------------------------------------
    // Check API key
    // -----------------------------------------

    if (!apiKey) {
      console.error(
        "GEMINI_API_KEY is missing."
      );

      return NextResponse.json(
        {
          success: false,
          error:
            "Gemini API key is missing. Add GEMINI_API_KEY to .env.local and restart the development server.",
          code: "MISSING_API_KEY",
        },
        { status: 500 }
      );
    }

    // -----------------------------------------
    // Read request
    // -----------------------------------------

    let body;

    try {
      body = await request.json();
    } catch (error) {
      return NextResponse.json(
        {
          success: false,
          error:
            "Invalid request data.",
          code: "INVALID_REQUEST",
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
      typeof body?.fileName === "string"
        ? body.fileName
        : "uploaded-image";

    const fileType =
      typeof body?.fileType === "string"
        ? body.fileType
        : "image/jpeg";

    // -----------------------------------------
    // Image required
    // -----------------------------------------

    if (!image) {
      return NextResponse.json(
        {
          success: false,
          error:
            "Please upload an image first.",
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
      base64Image =
        image.substring(
          image.indexOf(",") + 1
        );
    }

    if (!base64Image) {
      return NextResponse.json(
        {
          success: false,
          error:
            "The uploaded image is empty or invalid.",
          code: "INVALID_IMAGE",
        },
        { status: 400 }
      );
    }

    // -----------------------------------------
    // Supported MIME types
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
    // Question instruction
    // -----------------------------------------

    let questionInstruction = "";

    if (question) {
      questionInstruction = `
The user asked:

"${question}"

Answer this question using the image as visual evidence.

If the image does not contain enough information,
clearly say that instead of inventing an answer.
`;
    } else {
      questionInstruction = `
The user did not ask a specific question.

Perform a general visual assessment of the image.

If a plant or crop is visible, examine:
- crop identity
- plant health
- disease symptoms
- pests
- nutrient deficiency symptoms
- discoloration
- spots
- wilting
- physical damage
- unusual growth
- visible environmental stress

If no agricultural information can be determined,
clearly explain that.
`;
    }

    // -----------------------------------------
    // Crop instruction
    // -----------------------------------------

    let cropInstruction = "";

    if (crop) {
      cropInstruction = `
The user says the crop is:

"${crop}"

Use this as additional context, but compare it with
what is actually visible in the image.
`;
    } else {
      cropInstruction = `
The user did not specify the crop.

Try to identify the crop from the image if possible.

If it cannot be identified reliably,
use "Unknown".
`;
    }

    // -----------------------------------------
    // Gemini prompt
    // -----------------------------------------

    const prompt = `
You are the AI agricultural assistant for AgriConnect.

Analyze the uploaded image and return a useful result.

IMPORTANT:

Every valid image must receive a result.

Do NOT simply reject an image because it contains:
- a person
- animal
- vehicle
- building
- landscape
- document
- random object
- blurry content
- dark content
- unrelated content

Instead explain what you can determine.

Never invent a crop disease.

Never pretend an unrelated image is a crop.

Never claim certainty when the visual evidence is insufficient.

${cropInstruction}

${questionInstruction}

IMAGE RULES:

If a plant is visible:
- identify it when possible
- assess visible health
- identify possible diseases
- identify possible pests
- identify possible nutrient deficiencies
- identify visible damage
- provide practical recommendations

If the crop looks healthy:
report Healthy.

If disease is possible:
describe it as a possible or likely condition.

If the image is blurry, dark, overexposed,
too far away, obstructed, or otherwise unclear:
explain that image quality limits the assessment.

If there is no plant:
use:

condition = "No crop detected"

severity = "Unclear"

Explain that the image does not appear to contain
a crop or plant suitable for agricultural analysis.

If multiple objects are present:
focus on the plant if one is visible.

Do not invent symptoms.

Do not provide unsafe chemical instructions.

If agricultural products are mentioned,
recommend following product labels and local
agricultural guidance.

SEVERITY MUST BE:

Healthy
Mild
Moderate
Severe
Unclear

CONFIDENCE must be a number from 0 to 100.

Return ONLY valid JSON.

Use exactly:

{
  "crop": "Crop name or Unknown",
  "condition": "Main visual assessment",
  "confidence": 0,
  "severity": "Unclear",
  "observations": [
    "Observation 1",
    "Observation 2"
  ],
  "recommendations": [
    "Recommendation 1",
    "Recommendation 2"
  ],
  "additional_information": "Additional useful information",
  "disclaimer": "This AI assessment is for informational purposes only. For serious crop problems, consult a qualified agricultural expert."
}
`;

    // -----------------------------------------
    // Gemini request
    // -----------------------------------------

    let response = null;

    let lastError = null;

    for (
      let attempt = 0;
      attempt < 3;
      attempt++
    ) {
      try {
        console.log(
          `Gemini request attempt ${
            attempt + 1
          } using ${MODEL}`
        );

        response =
          await ai.models.generateContent({
            model: MODEL,

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

        console.error(
          "================================"
        );

        console.error(
          "GEMINI ERROR"
        );

        console.error(
          error
        );

        console.error(
          "Message:",
          error?.message
        );

        console.error(
          "Status:",
          error?.status
        );

        console.error(
          "Code:",
          error?.code
        );

        console.error(
          "================================"
        );

        const message =
          String(
            error?.message || ""
          ).toLowerCase();

        const status =
          Number(error?.status);

        // -------------------------------------
        // Temporary Gemini capacity error
        // -------------------------------------

        const isTemporary =
          status === 429 ||
          status === 500 ||
          status === 502 ||
          status === 503 ||
          message.includes(
            "unavailable"
          ) ||
          message.includes(
            "high demand"
          ) ||
          message.includes(
            "overloaded"
          ) ||
          message.includes(
            "temporarily"
          );

        if (
          isTemporary &&
          attempt < 2
        ) {
          const delay =
            2000 *
            Math.pow(2, attempt);

          console.log(
            `Retrying Gemini in ${delay}ms...`
          );

          await new Promise(
            (resolve) =>
              setTimeout(
                resolve,
                delay
              )
          );

          continue;
        }

        break;
      }
    }

    // -----------------------------------------
    // Gemini completely failed
    // -----------------------------------------

    if (!response) {
      const message =
        String(
          lastError?.message || ""
        );

      const status =
        Number(lastError?.status);

      console.error(
        "Final Gemini failure:",
        lastError
      );

      // 401 / 403
      if (
        status === 401 ||
        status === 403
      ) {
        return NextResponse.json(
          {
            success: false,
            error:
              "Gemini rejected the API key. Check your GEMINI_API_KEY.",
            code: "INVALID_API_KEY",
          },
          { status: 500 }
        );
      }

      // 404
      if (
        status === 404 ||
        message.includes(
          "not found"
        )
      ) {
        return NextResponse.json(
          {
            success: false,
            error:
              `Gemini model "${MODEL}" was not found or is not available to this API key.`,
            code: "MODEL_NOT_FOUND",
          },
          { status: 500 }
        );
      }

      // 429
      if (
        status === 429 ||
        message.includes(
          "quota"
        ) ||
        message.includes(
          "rate limit"
        )
      ) {
        return NextResponse.json(
          {
            success: false,
            error:
              "Gemini API quota or rate limit was reached. Please try again later.",
            code: "QUOTA_ERROR",
          },
          { status: 429 }
        );
      }

      // 503
      if (
        status === 503 ||
        message.includes(
          "unavailable"
        ) ||
        message.includes(
          "high demand"
        )
      ) {
        return NextResponse.json(
          {
            success: false,
            error:
              "Gemini is temporarily busy. Please wait a few seconds and try again.",
            code: "AI_BUSY",
          },
          { status: 503 }
        );
      }

      // Generic Gemini error
      return NextResponse.json(
        {
          success: false,
          error:
            "Gemini could not process the image right now. Please try again.",
          code: "GEMINI_ERROR",
          debug:
            process.env.NODE_ENV ===
            "development"
              ? message
              : undefined,
        },
        { status: 500 }
      );
    }

    // -----------------------------------------
    // Extract response
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
        "Gemini returned an empty response."
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
        "Gemini JSON parsing error:",
        text
      );

      return NextResponse.json(
        {
          success: false,
          error:
            "Gemini returned an invalid result. Please try again.",
          code: "INVALID_AI_RESPONSE",
        },
        { status: 500 }
      );
    }

    // -----------------------------------------
    // Safe defaults
    // -----------------------------------------

    if (!result.crop) {
      result.crop = "Unknown";
    }

    if (!result.condition) {
      result.condition =
        "Unable to determine condition";
    }

    if (!result.severity) {
      result.severity =
        "Unclear";
    }

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

    if (
      typeof result.additional_information !==
      "string"
    ) {
      result.additional_information =
        "";
    }

    if (
      typeof result.disclaimer !==
      "string"
    ) {
      result.disclaimer =
        "This AI assessment is for informational purposes only. For serious crop problems, consult a qualified agricultural expert.";
    }

    // -----------------------------------------
    // Confidence
    // -----------------------------------------

    let confidence =
      Number(result.confidence);

    if (
      Number.isNaN(confidence)
    ) {
      confidence = 0;
    }

    result.confidence = Math.round(
      Math.max(
        0,
        Math.min(
          100,
          confidence
        )
      )
    );

    // -----------------------------------------
    // Success
    // -----------------------------------------

    console.log(
      "Gemini analysis successful."
    );

    return NextResponse.json({
      success: true,
      result,
      fileName,
    });
  } catch (error) {
    console.error(
      "================================"
    );

    console.error(
      "CROP ASSISTANT API ERROR"
    );

    console.error(
      error
    );

    console.error(
      "Message:",
      error?.message
    );

    console.error(
      "Status:",
      error?.status
    );

    console.error(
      "================================"
    );

    return NextResponse.json(
      {
        success: false,
        error:
          "Something went wrong while analyzing the image. Please try again.",
        code: "SERVER_ERROR",
      },
      { status: 500 }
    );
  }
}