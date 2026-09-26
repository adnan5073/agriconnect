import { NextResponse } from "next/server";

export async function POST(request) {
  try {
    const formData = await request.formData();

    const image = formData.get("image");

    if (!(image instanceof File)) {
      return NextResponse.json(
        {
          error: "Please upload an image."
        },
        {
          status: 400
        }
      );
    }

    if (!image.type.startsWith("image/")) {
      return NextResponse.json(
        {
          error: "Only image files are allowed."
        },
        {
          status: 400
        }
      );
    }

    return NextResponse.json({
      result:
        "Possible crop problem\n\n" +
        "The uploaded image may show signs of leaf disease, pest damage, or nutrient stress.\n\n" +
        "Recommended next steps:\n" +
        "• Check both sides of the leaf for pests.\n" +
        "• Check whether nearby plants show similar symptoms.\n" +
        "• Avoid applying chemicals without identifying the problem.\n" +
        "• Compare the symptoms with trusted agricultural information.\n" +
        "• Contact an agricultural expert for confirmation.\n\n" +
        "Demo AI response: Connect a trained crop-disease model for live diagnosis."
    });

  } catch (error) {
    console.error(error);

    return NextResponse.json(
      {
        error: "Something went wrong while processing the image."
      },
      {
        status: 500
      }
    );
  }
}