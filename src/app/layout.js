import { Inter } from "next/font/google";
import { Providers } from "./Providers";
import Header from "./components/Header";
import Footer from "./components/Footer";
import Auto from "./tours/auto/page";
import { Box } from "@chakra-ui/react";
import Script from "next/script";
//import "./globals.css";

const inter = Inter({ subsets: ["latin"] });

export const metadata = {
  metadataBase: new URL("https://anastasiashimuk.com/"),
  title: "Анастасия Шимук - Гид в Аргентине",
  description: "Туры по Буэнос Айресу и Аргентине",

  openGraph: {
    title: "Анастасия Шимук - Гид в Аргентине",
    description: "Туры по Буэнос Айресу и Аргентине",
    url: "https://anastasiashimuk.com/",
    type: "website",
    images: [
      {
        url: "https://anastasiashimuk.com/opengraph/Dios.png",
        width: 1000,
        height: 750,
        alt: "Dios-Diego-Maradonna",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Анастасия Шимук - Гид в Аргентине",
    description: "Туры по Буэнос Айресу и Аргентине",
    images: ["https://anastasiashimuk.com/opengraph/Dios.png"],
  },
};

export default function RootLayout({ children }) {
  return (
    <html lang="ru">
      <head>
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: `
    {
      "@context": "https://schema.org",
      "@type": "Person",
      "name": "Анастасия Шимук",
      "description": "Гид по Буэнос Айресу и Аргентине",
      "url": "https://anastasiashimuk.com/",
      "image": "https://anastasiashimuk.com/opengraph/Dios.png"
    }
  `,
          }}
        />
      </head>
      <Script
        src="https://www.googletagmanager.com/gtag/js?id=G-WRVS96THPS"
        strategy="afterInteractive"
      />
      <Script id="google-analytics" strategy="afterInteractive">
        {`
          window.dataLayer = window.dataLayer || [];
          function gtag(){dataLayer.push(arguments);}
          gtag('js', new Date());
          gtag('config', 'G-WRVS96THPS');
        `}
      </Script>
      <body className={inter.className}>
        <Providers>
          <Header />
          <Box minHeight="60vh">{children}</Box>
          <Footer />
        </Providers>
      </body>
    </html>
  );
}
