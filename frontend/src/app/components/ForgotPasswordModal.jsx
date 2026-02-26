"use client";

import { useState, useEffect } from "react";
import {
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

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export default function ForgotPasswordModal({ isOpen, onClose, initialEmail = "" }) {
  const [email, setEmail] = useState(initialEmail);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const toast = useToast();

  useEffect(() => {
    if (isOpen && initialEmail) {
      setEmail(initialEmail);
    }
  }, [isOpen, initialEmail]);

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
      setEmail("");
      onClose();
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

  const handleClose = () => {
    setEmail("");
    onClose();
  };

  return (
    <Modal isOpen={isOpen} onClose={handleClose} size="md">
      <ModalOverlay />
      <ModalContent>
        <ModalHeader>Восстановление пароля</ModalHeader>
        <ModalCloseButton />
        <ModalBody pb={6}>
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
        </ModalBody>
      </ModalContent>
    </Modal>
  );
}
