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
import PasswordInput from "@/app/components/PasswordInput";
import { useAuth } from "@/contexts/AuthContext";

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
  const { register } = useAuth();
  const toast = useToast();

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
      await register(email, password, fullName || undefined);
      toast({
        title: "Регистрация выполнена",
        description: "Проверьте email для активации аккаунта",
        status: "success",
        duration: 5000,
      });
      setEmail("");
      setPassword("");
      setFullName("");
      onClose();
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
    onClose();
  };

  return (
    <Modal isOpen={isOpen} onClose={handleClose} size="md">
      <ModalOverlay />
      <ModalContent>
        <ModalHeader>Создать аккаунт</ModalHeader>
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
            После регистрации вы получите письмо со ссылкой для активации аккаунта.
          </Text>
        </ModalBody>
      </ModalContent>
    </Modal>
  );
}
