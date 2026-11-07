import type { Metadata, Viewport } from "next";
import "./globals.css";
import { SITE } from "@/lib/site";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import RouteTransition from "@/components/RouteTransition";
import ScrollEffects from "@/components/ScrollEffects";

export const metadata: Metadata = {
  metadataBase: new URL(SITE.url),
  title: {
    default: "Học lập trình Scratch cho trẻ em 6-15 tuổi",
    template: `%s | ${SITE.name}`,
  },
  description: SITE.description,
  applicationName: SITE.name,
  icons: {
    icon: [
      { url: "/favicon.ico", type: "image/x-icon", sizes: "any" },
      { url: "/favicon.png", type: "image/png", sizes: "192x192" },
      { url: "/icon.svg", type: "image/svg+xml" },
    ],
    shortcut: "/favicon.ico",
    apple: "/favicon.png",
  },
  verification: { google: "lF1crMVnIiiy68SLqbzefbM0mKu7HK54YcVfTSstHkg" },
  openGraph: {
    title: "Học lập trình Scratch cho trẻ em 6-15 tuổi | ScratchKids",
    description: SITE.description,
    siteName: SITE.name,
    url: SITE.url,
    locale: "vi_VN",
    type: "website",
    images: [{ url: "/opengraph-image", width: 1200, height: 630, alt: "ScratchKids - Học lập trình Scratch cho trẻ em" }],
  },
  twitter: {
    card: "summary_large_image",
    title: "Học lập trình Scratch cho trẻ em 6-15 tuổi | ScratchKids",
    description: SITE.description,
    images: ["/opengraph-image"],
  },
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  themeColor: "#FF8A1F",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="vi">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="" />
        <link
          rel="stylesheet"
          href="https://fonts.googleapis.com/css2?family=Baloo+2:wght@600;700;800&family=Nunito:wght@400;600;700&display=swap&subset=vietnamese"
        />
      </head>
      <body className="flex min-h-screen flex-col">
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              "@context": "https://schema.org",
              "@graph": [
                {
                  "@type": "EducationalOrganization",
                  "@id": `${SITE.url}/#organization`,
                  name: SITE.name,
                  url: SITE.url,
                  description: SITE.description,
                },
                {
                  "@type": "WebSite",
                  "@id": `${SITE.url}/#website`,
                  name: SITE.name,
                  url: SITE.url,
                  inLanguage: "vi-VN",
                  publisher: { "@id": `${SITE.url}/#organization` },
                },
              ],
            }).replace(/</g, "\\u003c"),
          }}
        />
        <Header />
        <main className="flex-1">
          <RouteTransition>{children}</RouteTransition>
        </main>
        <Footer />
        <ScrollEffects />
      </body>
    </html>
  );
}
