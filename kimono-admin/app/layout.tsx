import "./globals.css";

export const metadata = {
  title: "Kimono Admin",
  description: "Approve, deny, and edit event submissions and signups.",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
