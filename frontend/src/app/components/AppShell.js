"use client";

import { Box } from "@chakra-ui/react";
import { usePathname } from "next/navigation";

import Footer from "./Footer";
import Header from "./Header";

export default function AppShell({ children }) {
  const pathname = usePathname();
  const isInstagramSnapshot = pathname?.startsWith("/events/instagram/");

  if (isInstagramSnapshot) {
    return children;
  }

  return (
    <>
      <Header />
      <Box minHeight="60vh">{children}</Box>
      <Footer />
    </>
  );
}
