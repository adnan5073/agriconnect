import { Inter } from 'next/font/google';
import './globals.css';

// Configure Inter font
const inter = Inter({ 
  subsets: ['latin'],
  variable: '--font-inter',
});

export const metadata = {
  title: 'AgriConnect - Smart Agricultural Resource Access Platform',
  description: 'Connect with agricultural resources, equipment, workers, and AI crop diagnosis.',
};

export default function RootLayout({ children }) {
  return (
    <html lang="en" className={inter.className}>
      <body className="antialiased font-sans">
        {children}
      </body>
    </html>
  );
}