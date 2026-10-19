import './globals.css';

export const metadata = {
  title: 'McPosted',
  description: 'Anonymous posts from people at your school.',
  appleWebApp: { capable: true, title: 'McPosted', statusBarStyle: 'default' },
};

export const viewport = {
  width: 'device-width',
  initialScale: 1,
  themeColor: '#f3efe6',
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="" />
        <link
          href="https://fonts.googleapis.com/css2?family=Anton&family=Figtree:wght@400;500;600;700;800&display=swap"
          rel="stylesheet"
        />
      </head>
      <body>
        <div className="app">{children}</div>
      </body>
    </html>
  );
}
