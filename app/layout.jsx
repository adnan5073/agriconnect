import { Inter } from 'next/font/google';
import './globals.css';

const inter = Inter({
  subsets: ['latin'],
  variable: '--font-inter',
  display: 'swap',
});

export const metadata = {
  title: 'Agri-Connect | Empowering Every Farmer, Everywhere',
  description: 'Connect with tools, seeds, equipment, and local agricultural expertise.',
};

export default function RootLayout({ children }) {
  return (
    <html lang="en" className={inter.variable}>
      <body className={`${inter.className} antialiased bg-slate-50 text-slate-900`}>
        {children}
      </body>
    </html>
  );
}