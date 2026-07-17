import "./globals.css";

export const metadata = {
  title: "Weds Siva Rajesh & Suchitra - Wedding Invitation",
  description: "Wedding Invitation: Siva Rajesh & Suchitra. Join us to celebrate our wedding on August 22, 2026.",
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
