import './globals.css';

export const metadata = {
  title: 'Reunion Tour',
  description: 'Music trivia party game',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className="bg-black text-white font-sans antialiased min-h-screen">
        {children}
      </body>
    </html>
  );
}