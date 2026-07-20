import "./globals.css";

export const metadata = {
  title: "Weds Siva Rajesh & Suchitra - Wedding Invitation",
  description: "Wedding Invitation: Siva Rajesh & Suchitra. Join us to celebrate our wedding on August 22, 2026.",
  openGraph: {
    title: "Wedding Invitation: Siva Rajesh & Suchitra",
    description: "You are cordially invited to our wedding celebration on 22 August 2026.",
    type: "website",
    locale: "en_IN",
  },
  twitter: {
    card: "summary_large_image",
    title: "Wedding Invitation: Siva Rajesh & Suchitra",
    description: "Join us to celebrate our wedding on August 22, 2026.",
  },
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body>
        {children}
      </body>
    </html>
  );
}
