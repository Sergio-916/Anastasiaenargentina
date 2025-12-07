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
import emailjs from "@emailjs/browser";
import { useState, useRef, useEffect } from "react";

function ContactForm() {
  const form = useRef();

  const [message, setMessage] = useState(false);
  const [error, setError] = useState(null);
  const [input, setInput] = useState("");
  const [input2, setInput2] = useState("");
  const [input3, setInput3] = useState("");
  const [inputPhone, setInputPhone] = useState("");

  const sendEmail = (e) => {
    e.preventDefault();
    setMessage(false);
    setError(null);

    emailjs
      .sendForm(
        "service_kw0bprj",
        "template_h7850r8",
        form.current,
        "XcUWmv7bmo-3o80Ah"
      )
      .then(
        (result) => {
          // console.log(result.text);
          form.current.reset(); /// reset form
          setMessage(true);
        },
        (error) => {
          // console.log(error.text);
          setError(
            "Сервис временно недоступен. Пожалуйста, попробуйте еще раз."
          );
        }
      );
  };

  const handleInputChange = (e) => setInput(e.target.value);
  const handleInputChange2 = (e) => setInput2(e.target.value);
  const handleInputChange3 = (e) => setInput3(e.target.value);
  const handleInputChangePhone = (e) => setInputPhone(e.target.value);

  useEffect(() => {
    if (message) {
      setInput("");
      setInput2("");
      setInput3("");
      setInputPhone("");
    }
  }, [message]);

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
        <form ref={form} onSubmit={sendEmail}>
          <FormControl>
            <FormLabel fontSize={['md', 'lg','xl']} mt={3}>Имя</FormLabel>
            <Input
              type="text"
              name="from_name"
              value={input}
              onChange={handleInputChange}
            />
            <FormLabel fontSize={['md', 'lg','xl']} mt={3}>Телефон</FormLabel>
            <Input
              type="text"
              name="user_phone"
              value={inputPhone}
              onChange={handleInputChangePhone}
            />
            <FormLabel fontSize={['md', 'lg','xl']} mt={3}>Email</FormLabel>
            <Input
              type="email"
              name="user_email"
              value={input2}
              onChange={handleInputChange2}
            />
            <FormLabel fontSize={['md', 'lg','xl']} mt={3}>Сообщение</FormLabel>
            <Textarea onChange={handleInputChange3} value={input3} name="message" />
          </FormControl>
          <Button
            size={["sm", "md", "lg"]}
            fontSize={["lg", "lg", "xl"]}
            w="100%"
            mt={5}
            colorScheme="teal"
            type="submit"
            value="Send"
            isDisabled={input.length == 0 || input2.length == 0 || inputPhone.length == 0}
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
