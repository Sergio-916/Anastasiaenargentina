import { Inter } from "next/font/google";
import { Providers } from "./Providers";
import Header from "./components/Header";
import Footer from "./components/Footer";
//import "./globals.css";

const inter = Inter({ subsets: ["latin"] });

export const metadata = {
  title: "Анастасия Шимук - Гид в Аргентине",
  description: "Туры по Буэнос Айресу и Аргентине",
};

export default function RootLayout({ children }) {
  return (
    <html lang="ru">
      <body className={inter.className}>
        <Providers>
          <Header />
          {children}
          <Footer />
        </Providers>
      </body>
    </html>
  );
}
