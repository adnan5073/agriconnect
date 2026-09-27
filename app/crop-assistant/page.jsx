"use client";

import { useState } from "react";
import {
  Upload,
  Camera,
  Leaf,
  Search,
  Loader2,
  AlertCircle,
  ShieldCheck,
  X,
} from "lucide-react";

export default function CropAssistantPage() {
  const [file, setFile] = useState(null);
  const [preview, setPreview] = useState("");
  const [crop, setCrop] = useState("");
  const [question, setQuestion] = useState("");

  const [result, setResult] = useState(null);
  const [error, setError] = useState("");

  const [loading, setLoading] = useState(false);

  // -----------------------------------------
  // Image quality check
  // -----------------------------------------

  function checkImageQuality(file) {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();

      reader.onload = () => {
        const img = new Image();

        img.onload = () => {
          const width = img.width;
          const height = img.height;

          // Very low resolution
          if (width < 500 || height < 500) {
            reject(
              new Error(
                "The image resolution is too low. Please upload a clearer and larger photo of the crop."
              )
            );
            return;
          }

          // Extremely large image dimensions
          if (width > 12000 || height > 12000) {
            reject(
              new Error(
                "The image dimensions are too large. Please use a normal camera photo."
              )
            );
            return;
          }

          // Canvas for basic brightness and sharpness estimation
          const canvas =
            document.createElement("canvas");

          const maxCheckSize = 800;

          let checkWidth = width;
          let checkHeight = height;

          if (checkWidth > checkHeight) {
            if (checkWidth > maxCheckSize) {
              checkHeight =
                (checkHeight * maxCheckSize) /
                checkWidth;

              checkWidth = maxCheckSize;
            }
          } else {
            if (checkHeight > maxCheckSize) {
              checkWidth =
                (checkWidth * maxCheckSize) /
                checkHeight;

              checkHeight = maxCheckSize;
            }
          }

          canvas.width = checkWidth;
          canvas.height = checkHeight;

          const context =
            canvas.getContext("2d", {
              willReadFrequently: true,
            });

          if (!context) {
            resolve();
            return;
          }

          context.drawImage(
            img,
            0,
            0,
            checkWidth,
            checkHeight
          );

          const imageData =
            context.getImageData(
              0,
              0,
              checkWidth,
              checkHeight
            );

          const data = imageData.data;

          let brightness = 0;
          let contrast = 0;

          const grayValues = [];

          // Sample pixels instead of processing every pixel
          const step = 4;

          for (
            let i = 0;
            i < data.length;
            i += 4 * step
          ) {
            const r = data[i];
            const g = data[i + 1];
            const b = data[i + 2];

            const gray =
              0.299 * r +
              0.587 * g +
              0.114 * b;

            brightness += gray;
            grayValues.push(gray);
          }

          if (grayValues.length > 0) {
            brightness =
              brightness /
              grayValues.length;

            let variance = 0;

            for (const value of grayValues) {
              variance +=
                Math.pow(
                  value - brightness,
                  2
                );
            }

            contrast =
              variance /
              grayValues.length;
          }

          // Very dark
          if (brightness < 25) {
            reject(
              new Error(
                "The image is too dark. Please take the crop photo in better lighting."
              )
            );
            return;
          }

          // Very bright
          if (brightness > 245) {
            reject(
              new Error(
                "The image is too bright or overexposed. Please take another photo with better lighting."
              )
            );
            return;
          }

          // Extremely low contrast
          if (contrast < 120) {
            reject(
              new Error(
                "The image appears unclear or too flat. Please upload a clearer photo with better lighting."
              )
            );
            return;
          }

          resolve({
            width,
            height,
            brightness,
            contrast,
          });
        };

        img.onerror = () => {
          reject(
            new Error(
              "This image could not be read. Please upload a valid JPG, PNG, or WebP image."
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
  // Compress image
  // -----------------------------------------

  function compressImage(file) {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();

      reader.onload = () => {
        const img = new Image();

        img.onload = () => {
          const maxSize = 1600;

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
              0.82
            );

          resolve(compressed);
        };

        img.onerror = () => {
          reject(
            new Error(
              "Unable to read the image."
            )
          );
        };

        img.src = reader.result;
      };

      reader.onerror = () => {
        reject(
          new Error(
            "Unable to load the image."
          )
        );
      };

      reader.readAsDataURL(file);
    });
  }

  // -----------------------------------------
  // Select image
  // -----------------------------------------

  async function handleFileChange(event) {
    const selectedFile =
      event.target.files?.[0];

    if (!selectedFile) return;

    setError("");
    setResult(null);

    // File type
    const supportedTypes = [
      "image/jpeg",
      "image/png",
      "image/webp",
      "image/jpg",
    ];

    if (
      !supportedTypes.includes(
        selectedFile.type
      )
    ) {
      setError(
        "Unsupported image format. Please upload a JPG, PNG, or WebP image."
      );
      return;
    }

    // File size
    if (
      selectedFile.size >
      8 * 1024 * 1024
    ) {
      setError(
        "Image must be smaller than 8 MB."
      );
      return;
    }

    setLoading(true);

    try {
      // Technical image quality check
      await checkImageQuality(
        selectedFile
      );

      setFile(selectedFile);

      const url =
        URL.createObjectURL(
          selectedFile
        );

      setPreview(url);
    } catch (error) {
      setError(
        error?.message ||
          "The selected image is not suitable for crop analysis."
      );

      setFile(null);
      setPreview("");
    } finally {
      setLoading(false);
    }
  }

  // -----------------------------------------
  // Remove image
  // -----------------------------------------

  function removeImage() {
    setFile(null);
    setPreview("");
    setResult(null);
    setError("");
  }

  // -----------------------------------------
  // Analyze crop
  // -----------------------------------------

  async function analyzeCrop() {
    setError("");
    setResult(null);

    if (!file) {
      setError(
        "Please upload a crop image first."
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
          "The server returned an invalid response. Please try again."
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
          "The AI did not return a valid crop assessment."
        );
      }

      setResult(data.result);
    } catch (error) {
      console.error(
        "Crop analysis error:",
        error
      );

      let message =
        error?.message ||
        "Unable to process the crop image.";

      if (
        message.includes(
          "Failed to fetch"
        )
      ) {
        message =
          "Unable to connect to the AI service. Please check your internet connection and try again.";
      }

      if (
        message.includes("503") ||
        message.includes(
          "UNAVAILABLE"
        )
      ) {
        message =
          "The AI service is temporarily busy. Please wait a few seconds and try again.";
      }

      setError(message);
    } finally {
      setLoading(false);
    }
  }

  // -----------------------------------------
  // Severity style
  // -----------------------------------------

  function severityClass(severity) {
    if (severity === "Healthy") {
      return "severity healthy";
    }

    if (severity === "Mild") {
      return "severity mild";
    }

    if (severity === "Moderate") {
      return "severity moderate";
    }

    if (severity === "Severe") {
      return "severity severe";
    }

    return "severity unclear";
  }

  return (
    <main className="page">
      <style jsx>{`
        * {
          box-sizing: border-box;
        }

        .page {
          min-height: 100vh;
          background: #f7f4e9;
          padding: 40px 20px 70px;
          color: #173b2b;
        }

        .container {
          max-width: 1100px;
          margin: auto;
        }

        .hero {
          text-align: center;
          margin-bottom: 35px;
        }

        .hero-icon {
          width: 70px;
          height: 70px;
          margin: auto;
          display: flex;
          align-items: center;
          justify-content: center;
          border-radius: 50%;
          background: #cfeee0;
        }

        .hero h1 {
          margin: 18px 0 10px;
          font-size: 38px;
        }

        .hero p {
          max-width: 700px;
          margin: auto;
          color: #66766d;
          line-height: 1.6;
        }

        .grid {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 25px;
        }

        .card {
          background: white;
          border-radius: 24px;
          padding: 25px;
          box-shadow:
            0 12px 35px
            rgba(25, 65, 45, 0.08);
        }

        .card h2 {
          margin-top: 0;
          font-size: 21px;
        }

        .upload {
          min-height: 350px;
          border: 2px dashed #a8cdbc;
          border-radius: 20px;
          display: flex;
          align-items: center;
          justify-content: center;
          text-align: center;
          overflow: hidden;
          position: relative;
        }

        .upload input {
          display: none;
        }

        .upload-label {
          cursor: pointer;
          width: 100%;
          height: 100%;
          min-height: 350px;
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          padding: 30px;
        }

        .upload-label:hover {
          background: #f5fbf7;
        }

        .upload-icon {
          width: 65px;
          height: 65px;
          display: flex;
          align-items: center;
          justify-content: center;
          border-radius: 18px;
          background: #e1f3e9;
          margin-bottom: 15px;
        }

        .preview {
          width: 100%;
          height: 350px;
          object-fit: contain;
          background: #eef3ef;
        }

        .remove {
          position: absolute;
          right: 12px;
          top: 12px;
          width: 38px;
          height: 38px;
          border: none;
          border-radius: 50%;
          background: white;
          cursor: pointer;
          display: flex;
          align-items: center;
          justify-content: center;
          box-shadow:
            0 5px 15px
            rgba(0, 0, 0, 0.15);
        }

        label.field-label {
          display: block;
          font-weight: 600;
          margin-bottom: 8px;
        }

        input.text,
        textarea {
          width: 100%;
          border: 1px solid #d5dfd8;
          border-radius: 13px;
          padding: 13px 15px;
          font-size: 15px;
          outline: none;
          margin-bottom: 20px;
          background: #fbfdfb;
        }

        textarea {
          min-height: 130px;
          resize: vertical;
        }

        input.text:focus,
        textarea:focus {
          border-color: #4c9870;
        }

        .buttons {
          display: flex;
          gap: 12px;
          flex-wrap: wrap;
        }

        .button {
          border: none;
          border-radius: 13px;
          padding: 14px 20px;
          font-weight: 700;
          cursor: pointer;
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 9px;
        }

        .primary {
          flex: 1;
          background: #245d43;
          color: white;
        }

        .camera {
          background: #dff2e7;
          color: #245d43;
        }

        .button:disabled {
          opacity: 0.6;
          cursor: not-allowed;
        }

        .error {
          margin-top: 18px;
          background: #fff0ef;
          border: 1px solid #efc4c0;
          color: #9b3932;
          padding: 15px;
          border-radius: 13px;
          display: flex;
          gap: 10px;
          align-items: flex-start;
          line-height: 1.5;
        }

        .result {
          margin-top: 30px;
        }

        .result-header {
          display: flex;
          justify-content: space-between;
          align-items: flex-start;
          gap: 20px;
          flex-wrap: wrap;
        }

        .condition {
          font-size: 28px;
          font-weight: 800;
          margin: 5px 0;
        }

        .severity {
          padding: 9px 14px;
          border-radius: 999px;
          font-weight: 700;
          display: inline-block;
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
          margin-top: 20px;
        }

        .confidence-top {
          display: flex;
          justify-content: space-between;
          margin-bottom: 7px;
        }

        .bar {
          height: 9px;
          border-radius: 10px;
          background: #e4eae5;
          overflow: hidden;
        }

        .bar-fill {
          height: 100%;
          background: #4d9a70;
          border-radius: 10px;
        }

        .section {
          margin-top: 25px;
        }

        .section h3 {
          font-size: 18px;
          margin-bottom: 10px;
        }

        .list {
          padding-left: 20px;
          line-height: 1.8;
          color: #52645a;
        }

        .info {
          background: #edf8f1;
          padding: 15px;
          border-radius: 13px;
          color: #466153;
          line-height: 1.6;
        }

        .disclaimer {
          margin-top: 18px;
          padding: 15px;
          border-radius: 13px;
          background: #f4f4ee;
          color: #69736d;
          font-size: 13px;
          line-height: 1.6;
          display: flex;
          gap: 10px;
        }

        .loading {
          position: fixed;
          inset: 0;
          background: rgba(20, 45, 34, 0.55);
          display: flex;
          align-items: center;
          justify-content: center;
          z-index: 100;
        }

        .loading-box {
          background: white;
          padding: 35px;
          border-radius: 22px;
          text-align: center;
          min-width: 270px;
        }

        .loading-box svg {
          margin-bottom: 15px;
        }

        @media (max-width: 800px) {
          .grid {
            grid-template-columns: 1fr;
          }

          .hero h1 {
            font-size: 30px;
          }

          .page {
            padding: 25px 15px 50px;
          }
        }
      `}</style>

      <div className="container">

        <section className="hero">
          <div className="hero-icon">
            <Leaf size={34} />
          </div>

          <h1>AI Crop Assistant</h1>

          <p>
            Upload a photo of your crop and ask
            a question. AgriConnect will analyze
            the image and provide an
            AI-assisted agricultural assessment.
          </p>
        </section>

        <div className="grid">

          {/* IMAGE */}
          <section className="card">
            <h2>1. Upload Crop Image</h2>

            <div className="upload">

              {preview ? (
                <>
                  <img
                    src={preview}
                    alt="Crop preview"
                    className="preview"
                  />

                  <button
                    className="remove"
                    onClick={removeImage}
                    type="button"
                  >
                    <X size={19} />
                  </button>
                </>
              ) : (
                <label className="upload-label">
                  <input
                    type="file"
                    accept="image/*"
                    capture="environment"
                    onChange={
                      handleFileChange
                    }
                  />

                  <div className="upload-icon">
                    <Upload size={28} />
                  </div>

                  <strong>
                    Upload a crop photo
                  </strong>

                  <p>
                    JPG, PNG or WebP
                  </p>
                </label>
              )}

            </div>

            <p
              style={{
                color: "#6c786f",
                fontSize: "13px",
                marginTop: "12px",
              }}
            >
              Take a clear photo of the affected
              leaf or plant for better results.
            </p>
          </section>

          {/* QUESTION */}
          <section className="card">

            <h2>
              2. Ask the Crop Assistant
            </h2>

            <label className="field-label">
              Crop name
            </label>

            <input
              className="text"
              type="text"
              placeholder="Example: Tomato"
              value={crop}
              onChange={(e) =>
                setCrop(e.target.value)
              }
            />

            <label className="field-label">
              What would you like to know?{" "}
              <span
                style={{
                  color: "#7a877f",
                  fontWeight: 400,
                }}
              >
                (Optional)
              </span>
            </label>

            <textarea
              placeholder="Optional: Ask anything about your crop..."
              value={question}
              onChange={(e) =>
                setQuestion(e.target.value)
              }
            />

            <div className="buttons">

              <button
                className="button camera"
                type="button"
                disabled={loading}
                onClick={() =>
                  document
                    .getElementById(
                      "cameraInput"
                    )
                    ?.click()
                }
              >
                <Camera size={18} />
                Camera
              </button>

              <input
                id="cameraInput"
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
                onClick={analyzeCrop}
                disabled={loading}
                type="button"
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
                    <Search size={18} />
                    Analyze Crop
                  </>
                )}
              </button>

            </div>

            {error && (
              <div className="error">
                <AlertCircle size={20} />
                <span>{error}</span>
              </div>
            )}

          </section>

        </div>

        {/* RESULT */}
        {result && (
          <section className="card result">

            <div className="result-header">

              <div>
                <p
                  style={{
                    margin: 0,
                    color: "#718077",
                  }}
                >
                  AI Assessment
                </p>

                <div className="condition">
                  {result.condition}
                </div>

                <p
                  style={{
                    margin: 0,
                    color: "#637169",
                  }}
                >
                  Crop:{" "}
                  <strong>
                    {result.crop}
                  </strong>
                </p>
              </div>

              <div
                className={severityClass(
                  result.severity
                )}
              >
                {result.severity}
              </div>

            </div>

            <div className="confidence">

              <div className="confidence-top">
                <strong>
                  Confidence
                </strong>

                <strong>
                  {result.confidence}%
                </strong>
              </div>

              <div className="bar">
                <div
                  className="bar-fill"
                  style={{
                    width: `${Math.max(
                      0,
                      Math.min(
                        100,
                        Number(
                          result.confidence
                        ) || 0
                      )
                    )}%`,
                  }}
                />
              </div>

            </div>

            <div className="section">
              <h3>Observations</h3>

              {result.observations?.length >
              0 ? (
                <ul className="list">
                  {result.observations.map(
                    (item, index) => (
                      <li key={index}>
                        {item}
                      </li>
                    )
                  )}
                </ul>
              ) : (
                <div className="info">
                  No specific observations
                  were returned.
                </div>
              )}
            </div>

            <div className="section">
              <h3>Recommendations</h3>

              {result.recommendations?.length >
              0 ? (
                <ul className="list">
                  {result.recommendations.map(
                    (item, index) => (
                      <li key={index}>
                        {item}
                      </li>
                    )
                  )}
                </ul>
              ) : (
                <div className="info">
                  No recommendations were
                  returned.
                </div>
              )}
            </div>

            {result.additional_information && (
              <div className="section">
                <h3>
                  Additional Information
                </h3>

                <div className="info">
                  {result.additional_information}
                </div>
              </div>
            )}

            <div className="disclaimer">
              <ShieldCheck size={19} />

              <span>
                {result.disclaimer}
              </span>
            </div>

          </section>
        )}

      </div>

      {loading && (
        <div className="loading">

          <div className="loading-box">

            <Loader2
              size={42}
              className="spin"
            />

            <h3>
              Analyzing your crop...
            </h3>

            <p>
              Please wait while the AI examines
              the image.
            </p>

          </div>

        </div>
      )}

      <style jsx global>{`
        .spin {
          animation: spin 1s linear infinite;
        }

        @keyframes spin {
          from {
            transform: rotate(0deg);
          }

          to {
            transform: rotate(360deg);
          }
        }
      `}</style>
    </main>
  );
}