"use client";
import {
  Heading,
  Input,
  Box,
  Divider,
  Textarea,
  FormControl,
  FormLabel,
  Button,
  Text,
} from "@chakra-ui/react";
import { useState, useRef } from "react";

function ContactForm() {
  const form = useRef();

  const [message, setMessage] = useState(false);
  const [error, setError] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    phone: "",
    email: "",
    message: "",
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const sendContact = async (e) => {
    e.preventDefault();
    setMessage(false);
    setError(null);
    setIsLoading(true);

    try {
      const response = await fetch("/contact-submit", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          name: formData.name,
          phone: formData.phone,
          email: formData.email,
          message: formData.message,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Failed to send message");
      }

      await response.json();
      form.current.reset();
      setFormData({
        name: "",
        phone: "",
        email: "",
        message: "",
      });
      setMessage(true);
    } catch (err) {
      setError(
        err.message || "Сервис временно недоступен. Пожалуйста, попробуйте еще раз."
      );
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <>
      <Box
        border="1px"
        p={5}
        borderColor="gray.300"
        borderRadius={10}
        boxShadow="lg"
      >
        <Heading>Свяжитесь со мной</Heading>
        <form ref={form} onSubmit={sendContact}>
          <FormControl>
            <FormLabel fontSize={['md', 'lg','xl']} mt={3}>Имя</FormLabel>
            <Input
              type="text"
              name="name"
              value={formData.name}
              onChange={handleChange}
            />
            <FormLabel fontSize={['md', 'lg','xl']} mt={3}>Телефон</FormLabel>
            <Input
              type="text"
              name="phone"
              value={formData.phone}
              onChange={handleChange}
            />
            <FormLabel fontSize={['md', 'lg','xl']} mt={3}>Email</FormLabel>
            <Input
              type="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
            />
            <FormLabel fontSize={['md', 'lg','xl']} mt={3}>Сообщение</FormLabel>
            <Textarea
              name="message"
              value={formData.message}
              onChange={handleChange}
            />
          </FormControl>
          <Button
            size={["sm", "md", "lg"]}
            fontSize={["lg", "lg", "xl"]}
            w="100%"
            mt={5}
            colorScheme="teal"
            type="submit"
            isLoading={isLoading}
            isDisabled={!formData.name || !formData.email || !formData.phone}
          >
            Отправить
          </Button>
        </form>
        <Divider mb={3} />
        {message && <Text color="green.500">Сообщение отправлено!</Text>}
        {error && <Text color="red.500">{error}</Text>}
      </Box>
    </>
  );
}

export default ContactForm;
