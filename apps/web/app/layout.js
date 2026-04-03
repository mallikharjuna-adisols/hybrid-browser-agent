import './globals.css';

export const metadata = {
  title: 'Orbit Control',
  description: 'AI provider control center with workers, auth, and MCP job dispatch.',
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
