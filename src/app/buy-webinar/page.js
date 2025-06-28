"use client";

import { useState, useRef } from "react";
import {
  Button,
  Container,
  Heading,
  Input,
  FormControl,
  FormLabel,
  Box,
  Text,
  Textarea,
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalFooter,
  ModalBody,
  ModalCloseButton,
  useDisclosure,
  List,
  ListItem,
  Link,
} from "@chakra-ui/react";
import emailjs from "@emailjs/browser";

function WebinarForm({ isOpen, onClose }) {
  const form = useRef();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(false);

  const sendEmail = (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError(null);
    setSuccess(false);

    const templateParams = {
      user_name: form.current.elements.user_name.value,
      "user_email-or-tel": form.current.elements["user_email-or-tel"].value,
      "telegram-nick": form.current.elements["telegram-nick"].value,
    };

    emailjs
      .send(
        "service_kw0bprj", // Same service ID as your contact form
        "template_5j2twpo", // <-- IMPORTANT: Replace with your new EmailJS template ID
        templateParams,
        "XcUWmv7bmo-3o80Ah" // Same public key as your contact form
      )
      .then(
        (result) => {
          console.log(result.text);
          setSuccess(true);
          setIsSubmitting(false);
          form.current.reset();
          setTimeout(onClose, 3000); // Close modal after 3 seconds
        },
        (error) => {
          console.log(error.text);
          setError(
            "Не удалось отправить подтверждение. Пожалуйста, попробуйте снова."
          );
          setIsSubmitting(false);
        }
      );
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose}>
      <ModalOverlay />
      <ModalContent>
        <ModalHeader>Купить вебинар</ModalHeader>
        <ModalBody>
          <Text>Реквизиты для оплаты:</Text>
          <List>
            <ListItem>
              Bybit UID: <code>100997754</code> - <b>50usdt</b>
            </ListItem>
            <ListItem>
              TRC20: <code>TYzQ53KPxA8FLyVB5gggnZwVqtzGHgvcGD</code> -{" "}
              <b>50usdt</b>
            </ListItem>
            <ListItem>
              Перевод на рублевую карту Альфа-банк по тел.{" "}
              <code>8(917)5581857</code> - <b>4000руб</b>
            </ListItem>
            <ListItem>
              Alias MercadoPago: <code>shimuk.anastasia</code> -{" "}
              <b>60000песо</b>
            </ListItem>
          </List>
          <br></br>
          После оплаты вы получите доступ в закрытую группу Телерам, где будут
          все материалы, а также бонусом, вы станете частью сообшества и сможете
          задать свои вопросы или поделться своими историями
        </ModalBody>
        <ModalBody mb={3}>
          <Text>Пришлите скриншот платежа любым удобным способом:</Text>
          <List>
            <ListItem>WhatsApp: +541127587985</ListItem>
            <ListItem>
              Telegram: <Link href="https://t.me/Sergio_916">@Sergio_916</Link>
            </ListItem>
            <ListItem>email: sergey.shpak79@gmail.com</ListItem>
          </List>
        </ModalBody>
        <ModalCloseButton />
        <ModalBody>
          <Text>*Не забудьте указать свой ник в Telegram</Text>
          {/* {success ? (
            <Text color="green.500">
              Спасибо за покупку! После проверки платежа мы с вами свяжемся.
            </Text>
          ) : (
            <form ref={form} onSubmit={sendEmail}>
              <FormControl isRequired mb={2}>
                <FormLabel>Ваше имя</FormLabel>
                <Input type="text" name="user_name" />
              </FormControl>
              <FormControl isRequired mb={2}>
                <FormLabel>Email/Телефон</FormLabel>
                <Input type="text" name="user_email-or-tel" />
              </FormControl>
              <FormControl isRequired mb={2}>
                <FormLabel>Ник в Телеграм</FormLabel>
                <Input type="text" name="telegram-nick" placeholder="" />
              </FormControl>

              <Button
                type="submit"
                colorScheme="teal"
                isLoading={isSubmitting}
                width="full"
              >
                Отправить
              </Button>
              {error && (
                <Text color="red.500" mt={2}>
                  {error}
                </Text>
              )}
            </form>
          )} */}
        </ModalBody>
      </ModalContent>
    </Modal>
  );
}

export default function BuyWebinarPage() {
  const { isOpen, onOpen, onClose } = useDisclosure();

  return (
    <Container minH="60vh" py={10}>
      <Heading as="h1" size="xl" mb={4} textAlign="center">
        Вебинар: Как выбрать школу в Буэнос-Айресе
      </Heading>
      <Text fontSize="md" mb={6} textAlign="left">
        Выбираете школу для ребенка в Буэнос-Айресе? Не теряйтесь в догадках!
        <br />
        <br />
        1.5-часовой вебинар — это ваш гид по школам Буэнос-Айреса:
        <br />
        - Все виды школ: от католических до технических.
        <br />
        - Реальные рейтинги и подробности о "клубной" атмосфере.
        <br />
        - Узнайте, в какие школы стоит стремиться, а каких лучше избегать.
        <br />
        - Полный разбор стоимости, разницы между платными и бесплатными и всех
        нюансов выбора.
        <br />
        - Процесс поступления в секундарию.
        <br />
        <br />
        Примите осознанное решение для будущего вашего ребенка.
      </Text>
      <Text fontSize="lg" mb={6} textAlign="center">
        <strong>Стоимость: $50</strong>
      </Text>
      <Box textAlign="center">
        <Button colorScheme="teal" size="lg" onClick={onOpen}>
          Купить
        </Button>
      </Box>
      <WebinarForm isOpen={isOpen} onClose={onClose} />
    </Container>
  );
}
