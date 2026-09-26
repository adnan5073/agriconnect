import "./globals.css";

export const metadata = {
  title: "AgriConnect",
  description: "Helping farmers access the right agricultural resources"
};

export default function RootLayout({ children }) {
  return <html lang="en"><body>{children}</body></html>;
}
