import "./globals.css";

export const metadata = {
  title: "AgriConnect",
  description: "Agricultural platform for farmers",
  icons: {
    icon: "/img.png",
    shortcut: "/img.png",
    apple: "/img.png",
  },
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}