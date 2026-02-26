"use client";

import { Suspense, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import {
  Box,
  Button,
  Center,
  Flex,
  FormControl,
  FormLabel,
  Text,
  VStack,
  useToast,
} from "@chakra-ui/react";
import PasswordInput from "@/app/components/PasswordInput";

function ResetPasswordContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const toast = useToast();
  const token = searchParams.get("token");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  if (!token) {
    return (
      <Center h="60vh">
        <VStack spacing={4}>
          <Text fontSize="lg" color="red.500">
            Недействительная ссылка
          </Text>
          <Button colorScheme="teal" onClick={() => router.push("/login")}>
            Перейти к входу
          </Button>
        </VStack>
      </Center>
    );
  }

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!newPassword || !confirmPassword) {
      toast({
        title: "Ошибка",
        description: "Заполните оба поля",
        status: "error",
        duration: 3000,
      });
      return;
    }
    if (newPassword.length < 8) {
      toast({
        title: "Ошибка",
        description: "Пароль должен быть не менее 8 символов",
        status: "error",
        duration: 3000,
      });
      return;
    }
    if (newPassword !== confirmPassword) {
      toast({
        title: "Ошибка",
        description: "Пароли не совпадают",
        status: "error",
        duration: 3000,
      });
      return;
    }
    setIsSubmitting(true);
    try {
      const res = await fetch("/api/v1/reset-password/", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ token, new_password: newPassword }),
      });
      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        throw new Error(err.detail || "Не удалось обновить пароль");
      }
      toast({
        title: "Пароль обновлён",
        description: "Теперь вы можете войти с новым паролем",
        status: "success",
        duration: 3000,
      });
      router.push("/login");
    } catch (err) {
      toast({
        title: "Ошибка",
        description: err.message || "Недействительная или устаревшая ссылка",
        status: "error",
        duration: 4000,
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Flex minH="60vh" align="center" justify="center" p={4}>
      <Box
        w="full"
        maxW="400px"
        p={8}
        borderWidth={1}
        borderRadius="lg"
        boxShadow="md"
        bg="white"
      >
        <VStack spacing={6} align="stretch">
          <Text fontSize="2xl" fontWeight="bold" textAlign="center">
            Новый пароль
          </Text>
          <form onSubmit={handleSubmit}>
            <VStack spacing={4}>
              <FormControl isRequired>
                <FormLabel>Новый пароль</FormLabel>
                <PasswordInput
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  placeholder="Минимум 8 символов"
                  autoComplete="new-password"
                  minLength={8}
                />
              </FormControl>
              <FormControl isRequired>
                <FormLabel>Подтвердите пароль</FormLabel>
                <PasswordInput
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder="Повторите пароль"
                  autoComplete="new-password"
                  minLength={8}
                />
              </FormControl>
              <Button
                type="submit"
                colorScheme="teal"
                w="full"
                isLoading={isSubmitting}
                loadingText="Сохранение..."
              >
                Сохранить пароль
              </Button>
            </VStack>
          </form>
        </VStack>
      </Box>
    </Flex>
  );
}

export default function ResetPasswordPage() {
  return (
    <Suspense
      fallback={
        <Center h="60vh">
          <VStack spacing={4}>
            <Text fontSize="lg" color="gray.600">
              Загрузка...
            </Text>
          </VStack>
        </Center>
      }
    >
      <ResetPasswordContent />
    </Suspense>
  );
}
