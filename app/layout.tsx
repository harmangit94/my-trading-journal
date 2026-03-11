import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import { Toaster } from 'sonner';
import './globals.css';

const inter = Inter({ subsets: ['latin'] });

export const metadata: Metadata = {
  title: 'Trading Journal',
  description:
    'Professional day trading journal — track trades, analyse performance, master your psychology.',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className="dark">
      <body className={inter.className}>
        {children}
        <Toaster
          position="top-right"
          toastOptions={{
            style: {
              background: 'hsl(222, 44%, 10%)',
              border: '1px solid hsl(222, 30%, 18%)',
              color: 'hsl(214, 32%, 91%)',
            },
          }}
        />
      </body>
    </html>
  );
}
