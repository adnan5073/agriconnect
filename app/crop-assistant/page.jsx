"use client";

import { useRef, useState } from "react";
import {
  Upload,
  Camera,
  Leaf,
  Search,
  Loader2,
  AlertCircle,
  ShieldCheck,
  X,
  Sparkles,
  Image as ImageIcon,
  RefreshCw,
  CheckCircle2,
  Info,
  ArrowRight,
  ScanLine,
} from "lucide-react";

export default function CropAssistantPage() {
  const fileInputRef = useRef(null);
  const cameraInputRef = useRef(null);

  const [file, setFile] = useState(null);
  const [preview, setPreview] = useState("");
  const [crop, setCrop] = useState("");
  const [question, setQuestion] = useState("");

  const [result, setResult] = useState(null);
  const [error, setError] = useState("");
  const [warning, setWarning] = useState("");
  const [loading, setLoading] = useState(false);

  // -----------------------------------------
  // Image validation
  // We only reject files that are not usable
  // images. Visual suitability is decided by Gemini.
  // -----------------------------------------

  function validateImageFile(selectedFile) {
    if (!selectedFile) {
      throw new Error("Please select an image.");
    }

    const supportedTypes = [
      "image/jpeg",
      "image/png",
      "image/webp",
      "image/jpg",
    ];

    if (!supportedTypes.includes(selectedFile.type)) {
      throw new Error(
        "Unsupported image format. Please upload a JPG, PNG, or WebP image."
      );
    }

    if (selectedFile.size > 10 * 1024 * 1024) {
      throw new Error(
        "The image is larger than 10 MB. Please choose a smaller image."
      );
    }

    if (selectedFile.size < 1000) {
      throw new Error(
        "The selected file appears to be invalid or empty."
      );
    }
  }

  // -----------------------------------------
  // Basic image information
  // This does NOT reject blurry/wrong images.
  // Gemini will handle those.
  // -----------------------------------------

  function inspectImage(file) {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();

      reader.onload = () => {
        const img = new Image();

        img.onload = () => {
          const width = img.width;
          const height = img.height;

          let warningMessage = "";

          if (width < 500 || height < 500) {
            warningMessage =
              "This image has a relatively low resolution. Gemini will still analyze it, but a clearer photo may give better results.";
          }

          resolve({
            width,
            height,
            warning: warningMessage,
          });
        };

        img.onerror = () => {
          reject(
            new Error(
              "This image could not be opened. Please choose another image."
            )
          );
        };

        img.src = reader.result;
      };

      reader.onerror = () => {
        reject(
          new Error(
            "Unable to read the selected image."
          )
        );
      };

      reader.readAsDataURL(file);
    });
  }

  // -----------------------------------------
  // Image preview
  // -----------------------------------------

  async function handleFileChange(event) {
    const selectedFile = event.target.files?.[0];

    if (!selectedFile) return;

    setError("");
    setWarning("");
    setResult(null);

    try {
      validateImageFile(selectedFile);

      const inspection = await inspectImage(
        selectedFile
      );

      setFile(selectedFile);

      const objectUrl =
        URL.createObjectURL(selectedFile);

      setPreview(objectUrl);

      if (inspection.warning) {
        setWarning(inspection.warning);
      }
    } catch (err) {
      setFile(null);
      setPreview("");

      setError(
        err?.message ||
          "Unable to use this image."
      );
    }

    event.target.value = "";
  }

  // -----------------------------------------
  // Remove image
  // -----------------------------------------

  function removeImage() {
    setFile(null);
    setPreview("");
    setResult(null);
    setError("");
    setWarning("");
  }

  // -----------------------------------------
  // Compress image before sending to Gemini
  // -----------------------------------------

  function compressImage(file) {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();

      reader.onload = () => {
        const img = new Image();

        img.onload = () => {
          const maxSize = 1800;

          let width = img.width;
          let height = img.height;

          if (width > height) {
            if (width > maxSize) {
              height =
                (height * maxSize) / width;
              width = maxSize;
            }
          } else {
            if (height > maxSize) {
              width =
                (width * maxSize) / height;
              height = maxSize;
            }
          }

          const canvas =
            document.createElement("canvas");

          canvas.width = width;
          canvas.height = height;

          const context =
            canvas.getContext("2d");

          if (!context) {
            reject(
              new Error(
                "Unable to process the image."
              )
            );
            return;
          }

          context.drawImage(
            img,
            0,
            0,
            width,
            height
          );

          const compressed =
            canvas.toDataURL(
              "image/jpeg",
              0.86
            );

          resolve(compressed);
        };

        img.onerror = () => {
          reject(
            new Error(
              "Unable to process the image."
            )
          );
        };

        img.src = reader.result;
      };

      reader.onerror = () => {
        reject(
          new Error(
            "Unable to read the image."
          )
        );
      };

      reader.readAsDataURL(file);
    });
  }

  // -----------------------------------------
  // Analyze
  // -----------------------------------------

  async function analyzeCrop() {
    setError("");
    setWarning("");
    setResult(null);

    if (!file) {
      setError(
        "Please upload an image first."
      );
      return;
    }

    setLoading(true);

    try {
      const base64Image =
        await compressImage(file);

      const response = await fetch(
        "/api/crop-assistant",
        {
          method: "POST",
          headers: {
            "Content-Type":
              "application/json",
          },
          body: JSON.stringify({
            crop: crop.trim(),
            question:
              question.trim(),
            image: base64Image,
            fileName: file.name,
            fileType: "image/jpeg",
          }),
        }
      );

      let data;

      try {
        data = await response.json();
      } catch {
        throw new Error(
          "The server returned an invalid response."
        );
      }

      if (!response.ok) {
        throw new Error(
          data?.error ||
            "Unable to analyze the image."
        );
      }

      if (
        !data.success ||
        !data.result
      ) {
        throw new Error(
          "The AI did not return a valid result."
        );
      }

      setResult(data.result);

      window.scrollTo({
        top:
          document.body.scrollHeight,
        behavior: "smooth",
      });
    } catch (err) {
      console.error(
        "Crop assistant error:",
        err
      );

      let message =
        err?.message ||
        "Something went wrong while analyzing the image.";

      if (
        message.includes(
          "Failed to fetch"
        )
      ) {
        message =
          "Unable to connect to AgriConnect AI. Please check your internet connection and try again.";
      }

      if (
        message.includes("503") ||
        message.includes(
          "UNAVAILABLE"
        ) ||
        message.includes(
          "temporarily busy"
        )
      ) {
        message =
          "Gemini is temporarily busy. Please wait a few seconds and try again.";
      }

      setError(message);
    } finally {
      setLoading(false);
    }
  }

  // -----------------------------------------
  // Example question
  // -----------------------------------------

  function setExampleQuestion(text) {
    setQuestion(text);
  }

  // -----------------------------------------
  // Severity class
  // -----------------------------------------

  function getSeverityClass(severity) {
    switch (severity) {
      case "Healthy":
        return "severity healthy";

      case "Mild":
        return "severity mild";

      case "Moderate":
        return "severity moderate";

      case "Severe":
        return "severity severe";

      default:
        return "severity unclear";
    }
  }

  // -----------------------------------------
  // Confidence
  // -----------------------------------------

  function getConfidence() {
    const value =
      Number(result?.confidence) || 0;

    return Math.max(
      0,
      Math.min(100, value)
    );
  }

  return (
    <main className="page">

      <style jsx>{`
        * {
          box-sizing: border-box;
        }

        .page {
          min-height: 100vh;
          position: relative;
          overflow: hidden;
          background:
            radial-gradient(
              circle at 10% 10%,
              rgba(181, 226, 198, 0.38),
              transparent 28%
            ),
            radial-gradient(
              circle at 90% 20%,
              rgba(219, 239, 201, 0.38),
              transparent 25%
            ),
            #f7f4e9;
          color: #173b2b;
          padding: 38px 20px 80px;
        }

        /* --------------------------------
           Animated background
        -------------------------------- */

        .background-orb {
          position: absolute;
          border-radius: 50%;
          filter: blur(2px);
          opacity: 0.35;
          pointer-events: none;
        }

        .orb-one {
          width: 250px;
          height: 250px;
          background: #b9e5c9;
          top: 120px;
          left: -100px;
          animation: floatOne 9s ease-in-out infinite;
        }

        .orb-two {
          width: 220px;
          height: 220px;
          background: #d8e8a9;
          right: -80px;
          top: 500px;
          animation: floatTwo 11s ease-in-out infinite;
        }

        .orb-three {
          width: 170px;
          height: 170px;
          background: #a9dbc0;
          left: 40%;
          bottom: 100px;
          animation: floatThree 8s ease-in-out infinite;
        }

        @keyframes floatOne {
          0%,
          100% {
            transform: translate(
              0,
              0
            );
          }

          50% {
            transform: translate(
              45px,
              35px
            );
          }
        }

        @keyframes floatTwo {
          0%,
          100% {
            transform: translate(
              0,
              0
            );
          }

          50% {
            transform: translate(
              -40px,
              -45px
            );
          }
        }

        @keyframes floatThree {
          0%,
          100% {
            transform: translateY(0);
          }

          50% {
            transform: translateY(-35px);
          }
        }

        .container {
          max-width: 1120px;
          margin: auto;
          position: relative;
          z-index: 2;
        }

        /* --------------------------------
           Hero
        -------------------------------- */

        .hero {
          text-align: center;
          margin-bottom: 35px;
        }

        .hero-icon-wrapper {
          position: relative;
          width: 82px;
          height: 82px;
          margin: auto;
        }

        .hero-icon {
          width: 76px;
          height: 76px;
          border-radius: 25px;
          background: linear-gradient(
            135deg,
            #d8f1df,
            #b8dfc6
          );
          display: flex;
          align-items: center;
          justify-content: center;
          color: #245d43;
          box-shadow:
            0 18px 45px
            rgba(41, 100, 67, 0.16);
          animation:
            heroFloat 4s
            ease-in-out infinite;
        }

        .sparkle {
          position: absolute;
          top: -7px;
          right: -7px;
          color: #6ca75f;
          animation:
            sparkle 2s
            ease-in-out infinite;
        }

        @keyframes heroFloat {
          0%,
          100% {
            transform: translateY(0)
              rotate(0deg);
          }

          50% {
            transform: translateY(-7px)
              rotate(2deg);
          }
        }

        @keyframes sparkle {
          0%,
          100% {
            opacity: 0.3;
            transform: scale(0.8)
              rotate(0deg);
          }

          50% {
            opacity: 1;
            transform: scale(1.2)
              rotate(20deg);
          }
        }

        .hero h1 {
          font-size: clamp(
            31px,
            5vw,
            46px
          );
          margin: 18px 0 10px;
          letter-spacing: -1px;
        }

        .gradient-text {
          background: linear-gradient(
            90deg,
            #245d43,
            #579a67,
            #245d43
          );
          background-size: 200%;
          -webkit-background-clip: text;
          color: transparent;
          animation: gradientMove 5s
            linear infinite;
        }

        @keyframes gradientMove {
          0% {
            background-position: 0%;
          }

          100% {
            background-position: 200%;
          }
        }

        .hero p {
          max-width: 710px;
          margin: auto;
          color: #66766d;
          line-height: 1.7;
          font-size: 16px;
        }

        .ai-badge {
          display: inline-flex;
          align-items: center;
          gap: 7px;
          padding: 7px 13px;
          border-radius: 999px;
          background: rgba(
            225,
            244,
            232,
            0.8
          );
          border: 1px solid #cce7d6;
          color: #357052;
          font-size: 13px;
          font-weight: 700;
          margin-top: 18px;
        }

        /* --------------------------------
           Main cards
        -------------------------------- */

        .grid {
          display: grid;
          grid-template-columns:
            minmax(0, 1.08fr)
            minmax(0, 0.92fr);
          gap: 25px;
        }

        .card {
          background: rgba(
            255,
            255,
            255,
            0.88
          );
          backdrop-filter: blur(14px);
          border: 1px solid
            rgba(207, 224, 214, 0.8);
          border-radius: 27px;
          padding: 26px;
          box-shadow:
            0 20px 60px
            rgba(30, 74, 51, 0.08);
          transition:
            transform 0.3s ease,
            box-shadow 0.3s ease;
        }

        .card:hover {
          transform: translateY(-3px);
          box-shadow:
            0 25px 70px
            rgba(30, 74, 51, 0.12);
        }

        .card-title {
          display: flex;
          align-items: center;
          gap: 11px;
          margin-bottom: 20px;
        }

        .title-icon {
          width: 42px;
          height: 42px;
          border-radius: 13px;
          background: #e2f3e8;
          color: #2c7050;
          display: flex;
          align-items: center;
          justify-content: center;
        }

        .card h2 {
          margin: 0;
          font-size: 20px;
        }

        /* --------------------------------
           Upload area
        -------------------------------- */

        .upload {
          min-height: 360px;
          border: 2px dashed #a9cdb7;
          border-radius: 21px;
          overflow: hidden;
          position: relative;
          background:
            linear-gradient(
              135deg,
              rgba(
                238,
                249,
                241,
                0.8
              ),
              rgba(
                248,
                250,
                239,
                0.8
              )
            );
        }

        .upload::before {
          content: "";
          position: absolute;
          width: 180px;
          height: 180px;
          border-radius: 50%;
          border: 1px solid
            rgba(71, 132, 91, 0.15);
          left: 50%;
          top: 50%;
          transform: translate(
            -50%,
            -50%
          );
          animation: pulseRing 3s
            ease-in-out infinite;
        }

        @keyframes pulseRing {
          0% {
            width: 150px;
            height: 150px;
            opacity: 0.2;
          }

          50% {
            width: 270px;
            height: 270px;
            opacity: 0.05;
          }

          100% {
            width: 150px;
            height: 150px;
            opacity: 0.2;
          }
        }

        .upload input {
          display: none;
        }

        .upload-label {
          cursor: pointer;
          width: 100%;
          min-height: 360px;
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          padding: 30px;
          position: relative;
          z-index: 2;
        }

        .upload-label:hover
          .upload-icon {
          transform: translateY(-7px)
            scale(1.05);
        }

        .upload-icon {
          width: 72px;
          height: 72px;
          border-radius: 21px;
          background: #dff2e7;
          color: #286b4b;
          display: flex;
          align-items: center;
          justify-content: center;
          margin-bottom: 17px;
          transition:
            transform 0.3s ease;
        }

        .upload-title {
          font-size: 18px;
          font-weight: 800;
        }

        .upload-subtitle {
          color: #7a877f;
          margin: 7px 0 0;
          font-size: 14px;
        }

        .preview {
          width: 100%;
          height: 360px;
          object-fit: contain;
          background: #edf3ee;
          display: block;
        }

        .preview-scan {
          position: absolute;
          left: 0;
          right: 0;
          height: 2px;
          background: #8fd19f;
          box-shadow:
            0 0 15px #8fd19f;
          animation: scan 3s
            ease-in-out infinite;
          opacity: 0.7;
          pointer-events: none;
        }

        @keyframes scan {
          0% {
            top: 5%;
          }

          50% {
            top: 95%;
          }

          100% {
            top: 5%;
          }
        }

        .remove {
          position: absolute;
          right: 13px;
          top: 13px;
          width: 40px;
          height: 40px;
          border: none;
          border-radius: 50%;
          background: rgba(
            255,
            255,
            255,
            0.94
          );
          cursor: pointer;
          display: flex;
          align-items: center;
          justify-content: center;
          box-shadow:
            0 7px 20px
            rgba(0, 0, 0, 0.16);
          z-index: 4;
          transition:
            transform 0.2s ease;
        }

        .remove:hover {
          transform: scale(1.08);
        }

        /* --------------------------------
           Fields
        -------------------------------- */

        .field {
          margin-bottom: 18px;
        }

        .field-label {
          display: flex;
          align-items: center;
          justify-content: space-between;
          font-weight: 700;
          margin-bottom: 8px;
          font-size: 14px;
        }

        .optional {
          color: #8a968f;
          font-weight: 400;
        }

        input.text,
        textarea {
          width: 100%;
          border: 1px solid #d5dfd8;
          border-radius: 14px;
          padding: 14px 15px;
          font-size: 15px;
          outline: none;
          background: #fbfdfb;
          color: #203e2f;
          transition:
            border-color 0.2s ease,
            box-shadow 0.2s ease;
        }

        input.text:focus,
        textarea:focus {
          border-color: #61a17b;
          box-shadow:
            0 0 0 4px
            rgba(
              91,
              158,
              116,
              0.1
            );
        }

        textarea {
          min-height: 120px;
          resize: vertical;
          line-height: 1.55;
        }

        .examples {
          display: flex;
          flex-wrap: wrap;
          gap: 7px;
          margin-top: -10px;
          margin-bottom: 18px;
        }

        .example {
          border: 1px solid #d4e5da;
          background: #f3f9f5;
          color: #3f7355;
          border-radius: 999px;
          padding: 7px 10px;
          font-size: 12px;
          cursor: pointer;
          transition:
            transform 0.2s ease,
            background 0.2s ease;
        }

        .example:hover {
          transform: translateY(-2px);
          background: #e6f4ea;
        }

        /* --------------------------------
           Buttons
        -------------------------------- */

        .buttons {
          display: flex;
          gap: 10px;
        }

        .button {
          border: none;
          border-radius: 14px;
          padding: 14px 17px;
          font-weight: 800;
          cursor: pointer;
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 8px;
          transition:
            transform 0.2s ease,
            box-shadow 0.2s ease;
        }

        .button:hover:not(:disabled) {
          transform: translateY(-2px);
        }

        .primary {
          flex: 1;
          background: linear-gradient(
            135deg,
            #245d43,
            #347b56
          );
          color: white;
          box-shadow:
            0 12px 25px
            rgba(
              36,
              93,
              67,
              0.2
            );
        }

        .camera {
          background: #e1f3e8;
          color: #245d43;
        }

        .button:disabled {
          opacity: 0.6;
          cursor: not-allowed;
        }

        /* --------------------------------
           Messages
        -------------------------------- */

        .message {
          margin-top: 16px;
          padding: 14px;
          border-radius: 14px;
          display: flex;
          gap: 10px;
          align-items: flex-start;
          line-height: 1.5;
          font-size: 14px;
        }

        .error {
          background: #fff0ef;
          border: 1px solid #efc4c0;
          color: #9b3932;
        }

        .warning {
          background: #fff8df;
          border: 1px solid #eadca9;
          color: #77621e;
        }

        /* --------------------------------
           Result
        -------------------------------- */

        .result {
          margin-top: 25px;
          animation:
            resultAppear 0.7s
            ease both;
        }

        @keyframes resultAppear {
          from {
            opacity: 0;
            transform: translateY(
              25px
            );
          }

          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        .result-top {
          display: flex;
          justify-content: space-between;
          align-items: flex-start;
          gap: 20px;
          flex-wrap: wrap;
        }

        .result-label {
          color: #7b877f;
          font-size: 13px;
          font-weight: 700;
          text-transform: uppercase;
          letter-spacing: 0.7px;
        }

        .condition {
          font-size: clamp(
            25px,
            4vw,
            34px
          );
          font-weight: 900;
          margin: 5px 0;
          color: #173b2b;
        }

        .severity {
          padding: 9px 15px;
          border-radius: 999px;
          font-weight: 800;
          white-space: nowrap;
        }

        .healthy {
          background: #ddf4e5;
          color: #287244;
        }

        .mild {
          background: #fff1ca;
          color: #8a6500;
        }

        .moderate {
          background: #ffe1b8;
          color: #9a5a00;
        }

        .severe {
          background: #ffe0df;
          color: #a3312e;
        }

        .unclear {
          background: #e8ecea;
          color: #5e6c64;
        }

        .confidence {
          margin-top: 24px;
          padding: 17px;
          border-radius: 17px;
          background: #f5faf6;
        }

        .confidence-top {
          display: flex;
          justify-content: space-between;
          margin-bottom: 8px;
        }

        .bar {
          height: 9px;
          border-radius: 10px;
          background: #dfe9e2;
          overflow: hidden;
        }

        .bar-fill {
          height: 100%;
          background: linear-gradient(
            90deg,
            #4c9469,
            #8ac875
          );
          border-radius: 10px;
          transition: width 1s ease;
        }

        .result-grid {
          display: grid;
          grid-template-columns:
            1fr 1fr;
          gap: 18px;
          margin-top: 22px;
        }

        .result-section {
          background: #fafcf9;
          border: 1px solid #e4ebe5;
          border-radius: 17px;
          padding: 18px;
        }

        .result-section h3 {
          margin: 0 0 11px;
          font-size: 16px;
        }

        .list {
          padding-left: 20px;
          margin: 0;
          line-height: 1.8;
          color: #52645a;
        }

        .info-box {
          margin-top: 18px;
          background: #edf8f1;
          padding: 16px;
          border-radius: 15px;
          color: #466153;
          line-height: 1.6;
        }

        .disclaimer {
          margin-top: 18px;
          padding: 15px;
          border-radius: 14px;
          background: #f4f4ee;
          color: #69736d;
          font-size: 13px;
          line-height: 1.6;
          display: flex;
          gap: 10px;
        }

        /* --------------------------------
           Feature strip
        -------------------------------- */

        .feature-strip {
          margin-top: 25px;
          display: grid;
          grid-template-columns:
            repeat(3, 1fr);
          gap: 12px;
        }

        .feature {
          background: rgba(
            255,
            255,
            255,
            0.68
          );
          border: 1px solid
            rgba(207, 224, 214, 0.8);
          border-radius: 16px;
          padding: 15px;
          display: flex;
          align-items: center;
          gap: 11px;
          color: #4f6658;
          font-size: 13px;
        }

        .feature-icon {
          width: 34px;
          height: 34px;
          border-radius: 10px;
          background: #e2f3e8;
          color: #347653;
          display: flex;
          align-items: center;
          justify-content: center;
          flex-shrink: 0;
        }

        /* --------------------------------
           Loading
        -------------------------------- */

        .loading {
          position: fixed;
          inset: 0;
          background:
            rgba(
              14,
              39,
              28,
              0.68
            );
          backdrop-filter: blur(7px);
          display: flex;
          align-items: center;
          justify-content: center;
          z-index: 100;
        }

        .loading-box {
          background: white;
          padding: 35px;
          border-radius: 25px;
          text-align: center;
          width: min(
            90%,
            360px
          );
          box-shadow:
            0 30px 80px
            rgba(0, 0, 0, 0.2);
        }

        .loading-icon {
          width: 68px;
          height: 68px;
          margin: auto;
          border-radius: 20px;
          background: #e0f3e7;
          display: flex;
          align-items: center;
          justify-content: center;
          color: #286b4b;
        }

        .loading-box h3 {
          margin: 18px 0 7px;
        }

        .loading-box p {
          color: #738078;
          margin: 0;
          line-height: 1.5;
        }

        .spin {
          animation:
            spin 1s linear infinite;
        }

        @keyframes spin {
          from {
            transform: rotate(0deg);
          }

          to {
            transform: rotate(360deg);
          }
        }

        /* --------------------------------
           Mobile
        -------------------------------- */

        @media (max-width: 820px) {
          .grid {
            grid-template-columns: 1fr;
          }

          .result-grid {
            grid-template-columns: 1fr;
          }

          .feature-strip {
            grid-template-columns: 1fr;
          }
        }

        @media (max-width: 520px) {
          .page {
            padding: 25px 13px 60px;
          }

          .card {
            padding: 18px;
            border-radius: 21px;
          }

          .buttons {
            flex-direction: column;
          }

          .button {
            width: 100%;
          }

          .upload,
          .upload-label,
          .preview {
            min-height: 300px;
            height: 300px;
          }

          .hero p {
            font-size: 14px;
          }
        }
      `}</style>

      {/* Animated background */}
      <div className="background-orb orb-one" />
      <div className="background-orb orb-two" />
      <div className="background-orb orb-three" />

      <div className="container">

        {/* HERO */}
        <section className="hero">

          <div className="hero-icon-wrapper">

            <div className="hero-icon">
              <Leaf size={38} />
            </div>

            <Sparkles
              size={21}
              className="sparkle"
            />

          </div>

          <div className="ai-badge">
            <Sparkles size={14} />
            Powered by Gemini AI
          </div>

          <h1>
            <span className="gradient-text">
              AI Crop Assistant
            </span>
          </h1>

          <p>
            Upload any image and let
            AgriConnect AI examine it.
            Get crop-health insights,
            observations and useful
            recommendations in seconds.
          </p>

        </section>

        {/* MAIN */}
        <div className="grid">

          {/* IMAGE CARD */}
          <section className="card">

            <div className="card-title">

              <div className="title-icon">
                <ImageIcon
                  size={21}
                />
              </div>

              <div>
                <h2>
                  Upload an Image
                </h2>

                <small
                  style={{
                    color: "#7a877f",
                  }}
                >
                  Any valid image can be
                  analyzed
                </small>
              </div>

            </div>

            <div className="upload">

              {preview ? (
                <>
                  <img
                    src={preview}
                    alt="Uploaded crop"
                    className="preview"
                  />

                  <div className="preview-scan" />

                  <button
                    className="remove"
                    type="button"
                    onClick={
                      removeImage
                    }
                    aria-label="Remove image"
                  >
                    <X size={19} />
                  </button>
                </>
              ) : (
                <label className="upload-label">

                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/jpeg,image/png,image/webp"
                    onChange={
                      handleFileChange
                    }
                  />

                  <div className="upload-icon">
                    <Upload
                      size={30}
                    />
                  </div>

                  <div className="upload-title">
                    Choose an image
                  </div>

                  <p className="upload-subtitle">
                    JPG, PNG or WebP •
                    Maximum 10 MB
                  </p>

                  <p
                    style={{
                      color: "#7b877f",
                      fontSize: "12px",
                      marginTop: "12px",
                    }}
                  >
                    Crop photos give the
                    most useful results.
                  </p>

                </label>
              )}

            </div>

            {warning && (
              <div className="message warning">
                <Info size={19} />
                <span>
                  {warning}
                </span>
              </div>
            )}

          </section>

          {/* QUESTION CARD */}
          <section className="card">

            <div className="card-title">

              <div className="title-icon">
                <Sparkles
                  size={21}
                />
              </div>

              <div>
                <h2>
                  Ask Gemini
                </h2>

                <small
                  style={{
                    color: "#7a877f",
                  }}
                >
                  Your question is optional
                </small>
              </div>

            </div>

            <div className="field">

              <label className="field-label">
                Crop name

                <span className="optional">
                  Optional
                </span>
              </label>

              <input
                className="text"
                type="text"
                placeholder="Example: Tomato"
                value={crop}
                onChange={(e) =>
                  setCrop(
                    e.target.value
                  )
                }
              />

            </div>

            <div className="field">

              <label className="field-label">
                What would you like to know?

                <span className="optional">
                  Optional
                </span>
              </label>

              <textarea
                placeholder="Example: Why are these leaves turning yellow?"
                value={question}
                onChange={(e) =>
                  setQuestion(
                    e.target.value
                  )
                }
              />

            </div>

            <div className="examples">

              <button
                className="example"
                type="button"
                onClick={() =>
                  setExampleQuestion(
                    "Does this plant show any disease symptoms?"
                  )
                }
              >
                Disease?
              </button>

              <button
                className="example"
                type="button"
                onClick={() =>
                  setExampleQuestion(
                    "Why are the leaves changing color?"
                  )
                }
              >
                Leaf color
              </button>

              <button
                className="example"
                type="button"
                onClick={() =>
                  setExampleQuestion(
                    "What should I do to improve the health of this plant?"
                  )
                }
              >
                Plant health
              </button>

            </div>

            <div className="buttons">

              <button
                className="button camera"
                type="button"
                disabled={loading}
                onClick={() =>
                  cameraInputRef.current?.click()
                }
              >
                <Camera size={18} />
                Camera
              </button>

              <input
                ref={cameraInputRef}
                type="file"
                accept="image/*"
                capture="environment"
                onChange={
                  handleFileChange
                }
                style={{
                  display: "none",
                }}
              />

              <button
                className="button primary"
                type="button"
                disabled={
                  loading || !file
                }
                onClick={
                  analyzeCrop
                }
              >

                {loading ? (
                  <>
                    <Loader2
                      size={18}
                      className="spin"
                    />
                    Analyzing...
                  </>
                ) : (
                  <>
                    <ScanLine
                      size={18}
                    />
                    Analyze Image
                    <ArrowRight
                      size={17}
                    />
                  </>
                )}

              </button>

            </div>

            {error && (
              <div className="message error">
                <AlertCircle
                  size={20}
                />

                <span>
                  {error}
                </span>
              </div>
            )}

          </section>

        </div>

        {/* FEATURE STRIP */}
        <div className="feature-strip">

          <div className="feature">
            <div className="feature-icon">
              <Leaf size={17} />
            </div>

            <span>
              Crop & plant recognition
            </span>
          </div>

          <div className="feature">
            <div className="feature-icon">
              <Sparkles size={17} />
            </div>

            <span>
              AI-powered visual analysis
            </span>
          </div>

          <div className="feature">
            <div className="feature-icon">
              <ShieldCheck
                size={17}
              />
            </div>

            <span>
              Practical agricultural guidance
            </span>
          </div>

        </div>

        {/* RESULT */}
        {result && (
          <section className="card result">

            <div className="result-top">

              <div>

                <div className="result-label">
                  Gemini AI Assessment
                </div>

                <div className="condition">
                  {result.condition}
                </div>

                <div
                  style={{
                    color: "#68766e",
                    fontSize: "14px",
                  }}
                >
                  Crop detected:{" "}
                  <strong>
                    {result.crop ||
                      "Unknown"}
                  </strong>
                </div>

              </div>

              <div
                className={getSeverityClass(
                  result.severity
                )}
              >
                {result.severity ||
                  "Unclear"}
              </div>

            </div>

            {/* CONFIDENCE */}
            <div className="confidence">

              <div className="confidence-top">

                <strong>
                  AI confidence
                </strong>

                <strong>
                  {getConfidence()}%
                </strong>

              </div>

              <div className="bar">

                <div
                  className="bar-fill"
                  style={{
                    width: `${getConfidence()}%`,
                  }}
                />

              </div>

            </div>

            <div className="result-grid">

              {/* OBSERVATIONS */}
              <div className="result-section">

                <h3>
                  <CheckCircle2
                    size={17}
                    style={{
                      verticalAlign:
                        "middle",
                      marginRight:
                        "7px",
                    }}
                  />
                  Observations
                </h3>

                {result.observations
                  ?.length > 0 ? (
                  <ul className="list">
                    {result.observations.map(
                      (item, index) => (
                        <li
                          key={index}
                        >
                          {item}
                        </li>
                      )
                    )}
                  </ul>
                ) : (
                  <div className="info-box">
                    No specific
                    observations were
                    returned.
                  </div>
                )}

              </div>

              {/* RECOMMENDATIONS */}
              <div className="result-section">

                <h3>
                  <Leaf
                    size={17}
                    style={{
                      verticalAlign:
                        "middle",
                      marginRight:
                        "7px",
                    }}
                  />
                  Recommendations
                </h3>

                {result.recommendations
                  ?.length > 0 ? (
                  <ul className="list">
                    {result.recommendations.map(
                      (item, index) => (
                        <li
                          key={index}
                        >
                          {item}
                        </li>
                      )
                    )}
                  </ul>
                ) : (
                  <div className="info-box">
                    No specific
                    recommendations were
                    returned.
                  </div>
                )}

              </div>

            </div>

            {result.additional_information && (
              <div className="info-box">

                <strong>
                  Additional information
                </strong>

                <div
                  style={{
                    marginTop: "6px",
                  }}
                >
                  {
                    result.additional_information
                  }
                </div>

              </div>
            )}

            <div className="disclaimer">

              <ShieldCheck
                size={19}
                style={{
                  flexShrink: 0,
                }}
              />

              <span>
                {result.disclaimer ||
                  "This AI assessment is for informational purposes only. For serious crop problems, consult a qualified agricultural expert."}
              </span>

            </div>

          </section>
        )}

      </div>

      {/* LOADING */}
      {loading && (
        <div className="loading">

          <div className="loading-box">

            <div className="loading-icon">

              <Loader2
                size={32}
                className="spin"
              />

            </div>

            <h3>
              Gemini is analyzing...
            </h3>

            <p>
              Examining the image and
              preparing your agricultural
              assessment.
            </p>

          </div>

        </div>
      )}

    </main>
  );
}