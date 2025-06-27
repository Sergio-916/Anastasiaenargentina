import { Inter } from "next/font/google";
import { Providers } from "./Providers";
import Header from "./components/Header";
import Footer from "./components/Footer";
import Auto from "./tours/auto/page";
import Head from "next/head";
import { Box } from "@chakra-ui/react";
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
      <Head>
        <title>{metadata.title}</title>
        <meta name="description" content={metadata.description} />
        <meta property="og:title" content={metadata.openGraph.title} />
        <meta
          property="og:description"
          content={metadata.openGraph.description}
        />
        <meta property="og:url" content={metadata.openGraph.url} />
        <meta property="og:type" content={metadata.openGraph.type} />
        <meta property="og:image" content={metadata.openGraph.images[0].url} />
        <meta
          property="og:image:width"
          content={metadata.openGraph.images[0].width}
        />
        <meta
          property="og:image:height"
          content={metadata.openGraph.images[0].height}
        />
        <meta
          property="og:image:alt"
          content={metadata.openGraph.images[0].alt}
        />
        <meta name="twitter:card" content={metadata.twitter.card} />
        <meta name="twitter:title" content={metadata.twitter.title} />
        <meta
          name="twitter:description"
          content={metadata.twitter.description}
        />
        <meta name="twitter:image" content={metadata.twitter.images[0]} />
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
      </Head>
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
