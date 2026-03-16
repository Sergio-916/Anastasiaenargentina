"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import {
  Box,
  Button,
  Flex,
  FormControl,
  FormLabel,
  Input,
  Link,
  VStack,
  Text,
  useToast,
} from "@chakra-ui/react";
import PasswordInput from "@/app/components/PasswordInput";
import { useAuth } from "@/contexts/AuthContext";
import CreateAccountModal from "@/app/components/CreateAccountModal";
import ForgotPasswordModal from "@/app/components/ForgotPasswordModal";




export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showCreateAccountModal, setShowCreateAccountModal] = useState(false);
  const [showForgotPasswordModal, setShowForgotPasswordModal] = useState(false);
  const { login, user, isLoading } = useAuth();
  const router = useRouter();
  const toast = useToast();

  const [showEmalPassModal, setShowEmalPassModal] = useState(false);


  
  // Use relative URL - middleware rewrites /api to backend
  const googleLoginUrl = "/api/v1/login/google";


  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!email || !password) {
      toast({
        title: "Ошибка",
        description: "Введите email и пароль",
        status: "error",
        duration: 3000,
      });
      return;
    }
    setIsSubmitting(true);
    try {
      await login(email, password);
      toast({
        title: "Вход выполнен",
        status: "success",
        duration: 2000,
      });
      router.push("/");
    } catch (err) {
      const isUserNotFound = err.message === "USER_NOT_FOUND" || err.detail === "USER_NOT_FOUND";
      if (isUserNotFound) {
        setShowCreateAccountModal(true);
      } else {
        toast({
          title: "Ошибка входа",
          description: err.message || "Неверный email или пароль",
          status: "error",
          duration: 4000,
        });
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  if (user && !isLoading) {
    router.replace("/");
    return null;
  }

  const toggleEmalPassModal = () => {
    setShowEmalPassModal(!showEmalPassModal);
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
            Вход
          </Text>

          <Button
            as="a"
            href={googleLoginUrl}
            colorScheme="google"
            color="white"
            bg="#4285F4"
            _hover={{ bg: "#357ae8" }}
            size="lg"
            w="full"
          >
            Войти через Google
          </Button>

          <Text textAlign="center" color="gray.600">или</Text>

          <Button
            colorScheme="teal"
            w="full"
            onClick={() => toggleEmalPassModal(true)}
          >
            Войти через email/пароль
          </Button>
          
          <form onSubmit={handleSubmit}>
            <VStack spacing={4}>
              {showEmalPassModal && (
                <>
              <FormControl isRequired>
                <FormLabel>Email</FormLabel>
                <Input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="email@example.com"
                  autoComplete="email"
                />
              </FormControl>
              <FormControl isRequired>
                <FormLabel>Пароль</FormLabel>
                <PasswordInput
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  autoComplete="current-password"
                />
              </FormControl>
              <Button
                type="submit"
                colorScheme="teal"
                w="full"
                isLoading={isSubmitting}
                loadingText="Вход..."
              >
                Войти
              </Button>
              <Link
                as="button"
                fontSize="sm"
                color="teal.500"
                _hover={{ textDecoration: "underline" }}
                onClick={() => setShowForgotPasswordModal(true)}
              >
                Забыли пароль?
              </Link>
          <Text fontSize="sm" color="gray.500" textAlign="center">
            Нет аккаунта?{" "}
            <Link
              as="button"
              color="teal.500"
              _hover={{ textDecoration: "underline" }}
              onClick={() => setShowCreateAccountModal(true)}
            >
              Создать аккаунт
            </Link>
          </Text>
              </>
              )}
            </VStack>
          </form>

        </VStack>
      </Box>

      <CreateAccountModal
        isOpen={showCreateAccountModal}
        onClose={() => setShowCreateAccountModal(false)}
        initialEmail={email}
      />
      <ForgotPasswordModal
        isOpen={showForgotPasswordModal}
        onClose={() => setShowForgotPasswordModal(false)}
        initialEmail={email}
      />
    </Flex>
  );
}
