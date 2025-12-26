import './globals.css';

export const metadata = {
  title: 'GuruSetu - Amrita Vishwa Vidyapeetham',
  description: 'Faculty Availability & Locator',
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body className="antialiased">{children}</body>
    </html>
  );
}