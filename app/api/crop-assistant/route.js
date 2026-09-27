import { NextResponse } from "next/server";

const N8N_WEBHOOK =
  "https://hadysinan.app.n8n.cloud/webhook/15888a11-34c4-4674-9c9d-528bdded0059";

export const runtime = "nodejs";

export async function POST(request) {
  try {
    /* -------------------------------------------------------
       READ REQUEST
    ------------------------------------------------------- */

    const body = await request.json();

    if (!body) {
      return NextResponse.json(
        {
          error: "No request data received.",
        },
        {
          status: 400,
        }
      );
    }

    const {
      action,
      crop,
      question,
      image,
      fileName,
      fileType,
    } = body;

    /* -------------------------------------------------------
       VALIDATION
    ------------------------------------------------------- */

    if (!image) {
      return NextResponse.json(
        {
          error:
            "No crop image was received. Please upload an image.",
        },
        {
          status: 400,
        }
      );
    }

    if (!question || !question.trim()) {
      return NextResponse.json(
        {
          error:
            "Please enter a question about your crop.",
        },
        {
          status: 400,
        }
      );
    }

    if (!image.startsWith("data:image/")) {
      return NextResponse.json(
        {
          error:
            "Invalid image format. Please upload a JPG, PNG, or WebP image.",
        },
        {
          status: 400,
        }
      );
    }

    /* -------------------------------------------------------
       IMAGE SIZE CHECK
    ------------------------------------------------------- */

    const commaIndex = image.indexOf(",");

    if (commaIndex === -1) {
      return NextResponse.json(
        {
          error: "The image data is invalid.",
        },
        {
          status: 400,
        }
      );
    }

    const base64Data = image.substring(
      commaIndex + 1
    );

    /*
     * Approximate decoded size.
     */
    const imageSize =
      Math.floor(
        (base64Data.length * 3) / 4
      );

    /*
     * Keep the server request reasonably small.
     */
    const MAX_IMAGE_SIZE = 5 * 1024 * 1024;

    if (imageSize > MAX_IMAGE_SIZE) {
      return NextResponse.json(
        {
          error:
            "The image is still too large. Please choose a smaller image.",
        },
        {
          status: 413,
        }
      );
    }

    /* -------------------------------------------------------
       SEND TO N8N
    ------------------------------------------------------- */

    const n8nPayload = {
      action: action || "crop_analysis",

      crop: crop || "",

      question: question.trim(),

      /*
       * Complete Data URL.
       * This allows n8n to identify the image type.
       */
      image: image,

      /*
       * Base64 without the data:image/... prefix.
       */
      imageBase64: base64Data,

      fileName:
        fileName || "crop-image.jpg",

      fileType:
        fileType || "image/jpeg",

      mimeType:
        fileType || "image/jpeg",
    };

    console.log(
      "Sending crop analysis request to n8n..."
    );

    console.log(
      "Crop:",
      n8nPayload.crop
    );

    console.log(
      "Question:",
      n8nPayload.question
    );

    console.log(
      "File:",
      n8nPayload.fileName
    );

    console.log(
      "Image size:",
      Math.round(imageSize / 1024),
      "KB"
    );

    /* -------------------------------------------------------
       N8N REQUEST
    ------------------------------------------------------- */

    const controller =
      new AbortController();

    const timeout = setTimeout(() => {
      controller.abort();
    }, 120000);

    let n8nResponse;

    try {
      n8nResponse = await fetch(
        N8N_WEBHOOK,
        {
          method: "POST",

          headers: {
            "Content-Type": "application/json",
            Accept: "application/json",
          },

          body: JSON.stringify(
            n8nPayload
          ),

          cache: "no-store",

          signal: controller.signal,
        }
      );
    } finally {
      clearTimeout(timeout);
    }

    /* -------------------------------------------------------
       READ N8N RESPONSE
    ------------------------------------------------------- */

    const responseText =
      await n8nResponse.text();

    console.log(
      "n8n HTTP status:",
      n8nResponse.status
    );

    console.log(
      "n8n response:",
      responseText
    );

    let responseData = {};

    if (responseText) {
      try {
        responseData =
          JSON.parse(responseText);
      } catch {
        responseData = {
          output: responseText,
        };
      }
    }

    /* -------------------------------------------------------
       N8N ERROR
    ------------------------------------------------------- */

    if (!n8nResponse.ok) {
      let errorMessage =
        responseData?.error ||
        responseData?.message ||
        responseData?.output;

      if (
        typeof errorMessage ===
        "object"
      ) {
        errorMessage =
          JSON.stringify(
            errorMessage
          );
      }

      if (!errorMessage) {
        errorMessage =
          `n8n returned HTTP ${n8nResponse.status}.`;
      }

      return NextResponse.json(
        {
          error: errorMessage,

          status:
            n8nResponse.status,

          source: "n8n",
        },
        {
          status: 502,
        }
      );
    }

    /* -------------------------------------------------------
       SUCCESS
    ------------------------------------------------------- */

    return NextResponse.json(
      responseData,
      {
        status: 200,
      }
    );
  } catch (error) {
    console.error(
      "Crop Assistant API Error:",
      error
    );

    if (
      error?.name ===
      "AbortError"
    ) {
      return NextResponse.json(
        {
          error:
            "The AI analysis took too long. Please try again with a clearer or smaller image.",
        },
        {
          status: 504,
        }
      );
    }

    return NextResponse.json(
      {
        error:
          error?.message ||
          "Unable to connect to the AI crop assistant.",
      },
      {
        status: 500,
      }
    );
  }
}