"use client";

import { Suspense, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Center, Spinner, Text, VStack } from "@chakra-ui/react";
import { useAuth } from "@/contexts/AuthContext";

function AuthCallbackContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { setToken } = useAuth();

  useEffect(() => {
    const token = searchParams.get("token");
    if (token) {
      setToken(token);
      // Remove token from URL for security
      window.history.replaceState({}, document.title, "/auth/callback");
      router.replace("/");
    } else {
      router.replace("/login");
    }
  }, [searchParams, setToken, router]);

  return (
    <Center h="60vh">
      <VStack spacing={4}>
        <Spinner size="xl" color="teal.500" thickness="4px" />
        <Text fontSize="lg" color="gray.600">
          Завершение входа...
        </Text>
      </VStack>
    </Center>
  );
}

export default function AuthCallbackPage() {
  return (
    <Suspense
      fallback={
        <Center h="60vh">
          <VStack spacing={4}>
            <Spinner size="xl" color="teal.500" thickness="4px" />
            <Text fontSize="lg" color="gray.600">
              Загрузка...
            </Text>
          </VStack>
        </Center>
      }
    >
      <AuthCallbackContent />
    </Suspense>
  );
}
