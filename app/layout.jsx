import "./globals.css";

export const metadata = {
  title: "AgriConnect",
  description:
    "Agricultural resource discovery and crop assistance platform"
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}