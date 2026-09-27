"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";

export default function ProductsPage() {
  const [products, setProducts] = useState([]);
  const [category, setCategory] = useState("All");
  const [loading, setLoading] = useState(true);

  async function loadProducts() {
    setLoading(true);

    let query = supabase
      .from("products")
      .select("*")
      .order("created_at", {
        ascending: false,
      });

    if (category !== "All") {
      query = query.eq("category", category);
    }

    const { data, error } = await query;

    if (error) {
      console.error(error);
    } else {
      setProducts(data || []);
    }

    setLoading(false);
  }

  useEffect(() => {
    loadProducts();
  }, [category]);

  return (
    <main
      style={{
        maxWidth: "1200px",
        margin: "auto",
        padding: "40px 20px",
      }}
    >
      <h1>AgriConnect Marketplace</h1>

      <div
        style={{
          display: "flex",
          gap: "10px",
          margin: "25px 0",
          flexWrap: "wrap",
        }}
      >
        {[
          "All",
          "Equipment",
          "Tools",
          "Seeds",
          "Fertilizers",
          "Irrigation",
        ].map((item) => (
          <button
            key={item}
            onClick={() => setCategory(item)}
          >
            {item}
          </button>
        ))}
      </div>

      {loading ? (
        <p>Loading products...</p>
      ) : products.length === 0 ? (
        <p>No products available.</p>
      ) : (
        <div
          style={{
            display: "grid",
            gridTemplateColumns:
              "repeat(auto-fit, minmax(250px, 1fr))",
            gap: "25px",
          }}
        >
          {products.map((product) => (
            <div
              key={product.id}
              style={{
                border: "1px solid #ddd",
                borderRadius: "15px",
                overflow: "hidden",
                background: "#fff",
              }}
            >
              {product.image_url && (
                <img
                  src={product.image_url}
                  alt={product.name}
                  style={{
                    width: "100%",
                    height: "220px",
                    objectFit: "cover",
                  }}
                />
              )}

              <div style={{ padding: "18px" }}>
                <small>
                  {product.category}
                </small>

                <h2>{product.name}</h2>

                <p>
                  {product.description}
                </p>

                {product.price && (
                  <strong>
                    ₹{product.price}
                    {product.price_unit
                      ? ` / ${product.price_unit}`
                      : ""}
                  </strong>
                )}

                <p>
                  📍 {product.location}
                </p>

                <p>
                  👤 {product.seller_name}
                </p>

                <p>
                  Status: {product.availability}
                </p>
              </div>
            </div>
          ))}
        </div>
      )}
    </main>
  );
}