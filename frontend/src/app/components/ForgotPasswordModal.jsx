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
import { getBackendUrl } from "@/utils/settings";

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const PASSWORD_RESET_TOKEN_KEY = "password_reset_token";

export default function ForgotPasswordModal({ isOpen, onClose, initialEmail = "" }) {
  const [email, setEmail] = useState(initialEmail);
  const [resetToken, setResetToken] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isWaitingForLink, setIsWaitingForLink] = useState(false);
  const toast = useToast();

  useEffect(() => {
    if (isOpen && initialEmail) {
      setEmail(initialEmail);
    }
  }, [isOpen, initialEmail]);

  useEffect(() => {
    function handleStorageChange(event) {
      if (event.key !== PASSWORD_RESET_TOKEN_KEY || !event.newValue) return;
      setResetToken(event.newValue);
      setIsWaitingForLink(false);
      localStorage.removeItem(PASSWORD_RESET_TOKEN_KEY);
    }

    window.addEventListener("storage", handleStorageChange);
    return () => window.removeEventListener("storage", handleStorageChange);
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!email) {
      toast({
        title: "Ошибка",
        description: "Введите email",
        status: "error",
        duration: 3000,
      });
      return;
    }
    if (!EMAIL_REGEX.test(email)) {
      toast({
        title: "Ошибка",
        description: "Введите корректный email",
        status: "error",
        duration: 3000,
      });
      return;
    }
    setIsSubmitting(true);
    try {
      const res = await fetch(`/api/v1/password-recovery/${encodeURIComponent(email)}`, {
        method: "POST",
      });
      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        const detail = err.detail || "Попробуйте позже";
        throw new Error(detail);
      }
      toast({
        title: "Письмо отправлено",
        description: "Проверьте email для восстановления пароля",
        status: "success",
        duration: 5000,
      });
      setIsWaitingForLink(true);
    } catch (err) {
      toast({
        title: "Ошибка",
        description: err.message || "Пользователь с таким email не найден",
        status: "error",
        duration: 4000,
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleResetPassword = async (e) => {
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
      const res = await fetch(`${getBackendUrl()}/api/v1/reset-password/`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ token: resetToken, new_password: newPassword }),
      });
      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        throw new Error(err.detail || "Не удалось обновить пароль");
      }
      toast({
        title: "Пароль обновлен",
        description: "Теперь вы можете войти с новым паролем",
        status: "success",
        duration: 3000,
      });
      handleClose();
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

  const handleClose = () => {
    setEmail("");
    setResetToken("");
    setNewPassword("");
    setConfirmPassword("");
    setIsWaitingForLink(false);
    onClose();
  };

  const modalTitle = resetToken
    ? "Новый пароль"
    : isWaitingForLink
      ? "Проверьте почту"
      : "Восстановление пароля";

  return (
    <Modal isOpen={isOpen} onClose={handleClose} size="md">
      <ModalOverlay />
      <ModalContent>
        <ModalHeader>{modalTitle}</ModalHeader>
        <ModalCloseButton />
        <ModalBody pb={6}>
          {resetToken ? (
            <form onSubmit={handleResetPassword}>
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
          ) : isWaitingForLink ? (
            <VStack spacing={5} align="stretch">
              <Box
                borderWidth="1px"
                borderColor="teal.100"
                borderRadius="lg"
                bg="teal.50"
                p={4}
              >
                <Text color="teal.900" fontWeight="600">
                  Мы отправили письмо на {email}.
                </Text>
                <Text color="gray.700" mt={2}>
                  Откройте ссылку из письма. Форма нового пароля появится здесь,
                  в этой вкладке.
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
                  <Button
                    type="submit"
                    colorScheme="teal"
                    w="full"
                    isLoading={isSubmitting}
                    loadingText="Отправка..."
                  >
                    Отправить ссылку
                  </Button>
                </VStack>
              </form>
              <Text fontSize="sm" color="gray.500" mt={4} textAlign="center">
                На указанный email вы получите письмо со ссылкой для сброса пароля.
              </Text>
            </>
          )}
        </ModalBody>
      </ModalContent>
    </Modal>
  );
}
