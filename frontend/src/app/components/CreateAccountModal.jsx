"use client";

import { useState, useEffect } from "react";
import {
  Box,
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalCloseButton,
  FormControl,
  FormLabel,
  Input,
  Button,
  VStack,
  Text,
  useToast,
} from "@chakra-ui/react";
import PasswordInput from "@/app/components/PasswordInput";
import { useAuth } from "@/contexts/AuthContext";

function getCurrentPath() {
  if (typeof window === "undefined") return "/";

  const currentPath = `${window.location.pathname}${window.location.search}`;
  const next = new URLSearchParams(window.location.search).get("next");
  if (
    window.location.pathname === "/login" &&
    next &&
    next.startsWith("/") &&
    !next.startsWith("//")
  ) {
    return next;
  }

  return currentPath;
}

export default function CreateAccountModal({ isOpen, onClose, initialEmail = "" }) {
  const [email, setEmail] = useState(initialEmail);

  useEffect(() => {
    if (isOpen && initialEmail) {
      setEmail(initialEmail);
    }
  }, [isOpen, initialEmail]);
  const [password, setPassword] = useState("");
  const [fullName, setFullName] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [pendingEmail, setPendingEmail] = useState("");
  const { register, user } = useAuth();
  const toast = useToast();

  useEffect(() => {
    if (!pendingEmail || !user) return;

    toast({
      title: "Email подтвержден",
      description: "Вы вошли в аккаунт",
      status: "success",
      duration: 3000,
    });
    handleClose();
  }, [pendingEmail, user]);

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
    if (password.length < 8) {
      toast({
        title: "Ошибка",
        description: "Пароль должен быть не менее 8 символов",
        status: "error",
        duration: 3000,
      });
      return;
    }
    setIsSubmitting(true);
    try {
      const registeredEmail = email;
      await register(email, password, fullName || undefined, getCurrentPath());
      toast({
        title: "Регистрация выполнена",
        description: "Проверьте email для активации аккаунта",
        status: "success",
        duration: 5000,
      });
      setEmail("");
      setPassword("");
      setFullName("");
      setPendingEmail(registeredEmail);
    } catch (err) {
      toast({
        title: "Ошибка регистрации",
        description: err.message || "Попробуйте позже",
        status: "error",
        duration: 4000,
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleClose = () => {
    setEmail("");
    setPassword("");
    setFullName("");
    setPendingEmail("");
    onClose();
  };

  const isWaitingForConfirmation = Boolean(pendingEmail);

  return (
    <Modal
      isOpen={isOpen}
      onClose={handleClose}
      size="md"
      closeOnOverlayClick={false}
    >
      <ModalOverlay />
      <ModalContent>
        <ModalHeader>
          {isWaitingForConfirmation ? "Проверьте почту" : "Создать аккаунт"}
        </ModalHeader>
        <ModalCloseButton />
        <ModalBody pb={6}>
          {isWaitingForConfirmation ? (
            <VStack spacing={5} align="stretch">
              <Box
                borderWidth="1px"
                borderColor="teal.100"
                borderRadius="lg"
                bg="teal.50"
                p={4}
              >
                <Text color="teal.900" fontWeight="600">
                  Мы отправили письмо на {pendingEmail}.
                </Text>
                <Text color="gray.700" mt={2}>
                  Перейдите в почтовый ящик и подтвердите адрес. После
                  подтверждения вы автоматически вернетесь на эту страницу.
                </Text>
              </Box>
              <Button colorScheme="teal" onClick={handleClose}>
                Понятно
              </Button>
            </VStack>
          ) : (
            <>
              <form onSubmit={handleSubmit}>
                <VStack spacing={4}>
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
                  <FormControl>
                    <FormLabel>Имя (необязательно)</FormLabel>
                    <Input
                      type="text"
                      value={fullName}
                      onChange={(e) => setFullName(e.target.value)}
                      placeholder="Ваше имя"
                      autoComplete="name"
                    />
                  </FormControl>
                  <FormControl isRequired>
                    <FormLabel>Пароль</FormLabel>
                    <PasswordInput
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder="Минимум 8 символов"
                      autoComplete="new-password"
                      minLength={8}
                    />
                  </FormControl>
                  <Button
                    type="submit"
                    colorScheme="teal"
                    w="full"
                    isLoading={isSubmitting}
                    loadingText="Регистрация..."
                  >
                    Создать аккаунт
                  </Button>
                </VStack>
              </form>
              <Text fontSize="sm" color="gray.500" mt={4} textAlign="center">
                После регистрации вы получите письмо со ссылкой для активации
                аккаунта.
              </Text>
            </>
          )}
        </ModalBody>
      </ModalContent>
    </Modal>
  );
}
