"use client";

import { Suspense, useEffect, useRef, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Center, Spinner, Text, VStack, Button } from "@chakra-ui/react";
import { useAuth } from "@/contexts/AuthContext";
import { getBackendUrl } from "@/utils/settings";

const VERIFY_TIMEOUT_MS = 15000;
const CLOSE_FALLBACK_REDIRECT_MS = 1200;

function getSafeNextPath(nextPath) {
  if (!nextPath || !nextPath.startsWith("/") || nextPath.startsWith("//")) {
    return "/";
  }
  return nextPath;
}

function VerifyEmailContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { setToken } = useAuth();
  const [status, setStatus] = useState("loading");
  const [error, setError] = useState(null);
  const hasVerified = useRef(false);

  const token = searchParams.get("token");
  const nextPath = getSafeNextPath(searchParams.get("next"));

  useEffect(() => {
    if (hasVerified.current) return;
    if (!token) {
      setStatus("error");
      setError("Invalid verification link");
      return;
    }

    hasVerified.current = true;

    async function verify() {
      const controller = new AbortController();
      const timeoutId = window.setTimeout(() => {
        controller.abort();
      }, VERIFY_TIMEOUT_MS);

      try {
        const res = await fetch(`${getBackendUrl()}/api/v1/auth/verify-email`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          signal: controller.signal,
          body: JSON.stringify({ token }),
        });

        if (!res.ok) {
          const err = await res.json().catch(() => ({}));
          throw new Error(err.detail || "Verification failed");
        }

        const data = await res.json();
        if (data.access_token) {
          setToken(data.access_token);
        }
        setStatus("success");
        window.setTimeout(() => {
          router.replace(nextPath);
        }, CLOSE_FALLBACK_REDIRECT_MS);
        window.close();
      } catch (err) {
        setStatus("error");
        setError(
          err.name === "AbortError"
            ? "Не удалось подтвердить email: сервер не ответил. Попробуйте открыть ссылку еще раз."
            : err.message || "Invalid or expired verification link"
        );
      } finally {
        window.clearTimeout(timeoutId);
      }
    }

    verify();
  }, [nextPath, router, token, setToken]);

  if (status === "loading") {
    return (
      <Center h="60vh">
        <VStack spacing={4}>
          <Spinner size="xl" color="teal.500" thickness="4px" />
          <Text fontSize="lg" color="gray.600">
            Подтверждение email...
          </Text>
        </VStack>
      </Center>
    );
  }

  if (status === "error") {
    return (
      <Center h="60vh">
        <VStack spacing={4}>
          <Text fontSize="lg" color="red.500">
            {error}
          </Text>
          <Button colorScheme="teal" onClick={() => router.push("/login")}>
            Перейти к входу
          </Button>
        </VStack>
      </Center>
    );
  }

  return (
    <Center h="60vh">
      <VStack spacing={4}>
        <Text fontSize="lg" color="green.600">
          Email подтвержден. Можно вернуться на вкладку сайта.
        </Text>
      </VStack>
    </Center>
  );
}

export default function VerifyEmailPage() {
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
      <VerifyEmailContent />
    </Suspense>
  );
}
