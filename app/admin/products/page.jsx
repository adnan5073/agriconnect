"use client";

import { useState } from "react";
import { supabase } from "@/lib/supabase";

export default function AddProduct() {
  const [form, setForm] = useState({
    name: "",
    category: "Equipment",
    subcategory: "",
    description: "",
    price: "",
    price_unit: "",
    location: "",
    seller_name: "",
    seller_phone: "",
    availability: "Available",
  });

  const [image, setImage] = useState(null);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");

  function handleChange(e) {
    setForm({
      ...form,
      [e.target.name]: e.target.value,
    });
  }

  async function handleSubmit(e) {
    e.preventDefault();

    setLoading(true);
    setMessage("");

    try {
      let imageUrl = null;

      // Upload image
      if (image) {
        const fileExt = image.name.split(".").pop();

        const fileName =
          `${Date.now()}-${Math.random()
            .toString(36)
            .substring(2)}.${fileExt}`;

        const filePath = `products/${fileName}`;

        const { error: uploadError } = await supabase.storage
          .from("product-images")
          .upload(filePath, image);

        if (uploadError) {
          throw uploadError;
        }

        const { data } = supabase.storage
          .from("product-images")
          .getPublicUrl(filePath);

        imageUrl = data.publicUrl;
      }

      // Insert product
      const { error } = await supabase
        .from("products")
        .insert([
          {
            name: form.name,
            category: form.category,
            subcategory: form.subcategory,
            description: form.description,
            price: form.price
              ? Number(form.price)
              : null,
            price_unit: form.price_unit,
            location: form.location,
            seller_name: form.seller_name,
            seller_phone: form.seller_phone,
            availability: form.availability,
            image_url: imageUrl,
          },
        ]);

      if (error) {
        throw error;
      }

      setMessage("Product added successfully!");

      setForm({
        name: "",
        category: "Equipment",
        subcategory: "",
        description: "",
        price: "",
        price_unit: "",
        location: "",
        seller_name: "",
        seller_phone: "",
        availability: "Available",
      });

      setImage(null);

      document.getElementById("productImage").value = "";
    } catch (error) {
      console.error(error);
      setMessage(error.message);
    }

    setLoading(false);
  }

  return (
    <div
      style={{
        maxWidth: "700px",
        margin: "40px auto",
        padding: "30px",
      }}
    >
      <h1>Add Agricultural Product</h1>

      <form onSubmit={handleSubmit}>

        <input
          name="name"
          placeholder="Product name"
          value={form.name}
          onChange={handleChange}
          required
        />

        <br /><br />

        <select
          name="category"
          value={form.category}
          onChange={handleChange}
        >
          <option value="Equipment">
            Equipment
          </option>

          <option value="Tools">
            Tools
          </option>

          <option value="Seeds">
            Seeds
          </option>

          <option value="Fertilizers">
            Fertilizers
          </option>

          <option value="Irrigation">
            Irrigation
          </option>
        </select>

        <br /><br />

        <input
          name="subcategory"
          placeholder="Subcategory"
          value={form.subcategory}
          onChange={handleChange}
        />

        <br /><br />

        <textarea
          name="description"
          placeholder="Description"
          value={form.description}
          onChange={handleChange}
        />

        <br /><br />

        <input
          type="number"
          name="price"
          placeholder="Price"
          value={form.price}
          onChange={handleChange}
        />

        <br /><br />

        <input
          name="price_unit"
          placeholder="Price unit e.g. per kg / per hour"
          value={form.price_unit}
          onChange={handleChange}
        />

        <br /><br />

        <input
          name="location"
          placeholder="Location"
          value={form.location}
          onChange={handleChange}
        />

        <br /><br />

        <input
          name="seller_name"
          placeholder="Seller / Provider name"
          value={form.seller_name}
          onChange={handleChange}
        />

        <br /><br />

        <input
          name="seller_phone"
          placeholder="Seller phone"
          value={form.seller_phone}
          onChange={handleChange}
        />

        <br /><br />

        <select
          name="availability"
          value={form.availability}
          onChange={handleChange}
        >
          <option value="Available">
            Available
          </option>

          <option value="Unavailable">
            Unavailable
          </option>
        </select>

        <br /><br />

        <input
          id="productImage"
          type="file"
          accept="image/*"
          onChange={(e) => setImage(e.target.files[0])}
          required
        />

        <br /><br />

        <button
          type="submit"
          disabled={loading}
        >
          {loading ? "Adding..." : "Add Product"}
        </button>

      </form>

      {message && (
        <p style={{ marginTop: "20px" }}>
          {message}
        </p>
      )}
    </div>
  );
}