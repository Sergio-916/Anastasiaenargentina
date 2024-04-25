import {
  Text,
  Heading,
  Container,
  Flex,
  Stack,
  List,
  ListItem,
  Button,
  Link
} from "@chakra-ui/react";


export const metadata = {
  title: "Мастер-класс по Филетеадо",
  description: "Мастер-классы в Буэнос Айресе, живопись, творческие мастерклассы, роспись фмлетеадо, роспись fileteado ",
};

import PhotoCarousel from "@/app/components/PhotoCarousel";
function Fileteado() {
  const photos = [
    "/master/felitiado/fileteado4.jpg",
    "/master/felitiado/fileteado5.jpg",
    "/master/felitiado/fileteado6.jpg",
  ];

  return (
    <>
      <Container maxW="container.xl">
        <Heading my={15} textAlign='center'>Мастер – класс по Филетеадо</Heading>

        <Text mb={10} p={7} fontSize={["md", "lg", "xl"]}>
          Мастер класс по Fileteado c мате или вином. Очень аутентичный опыт в
          матерской. Художник на английском (при необходимости будет перевод на
          русский) расскажет о традициях Fileteado (объект культурного наследия
          ЮНЕСКО), каждый из участников распишет для меня калобасу для матэ или
          именную доску. Вы увезете из Аргентины неповторимый сувенир, сделанный
          своими руками.
        </Text>
        <PhotoCarousel limitSize={[300,300,300]} photos={photos} breakpoints={{ slidesPerView: 1 }} />

        <List my={20} fontSize={["md", "lg", "xl"]} spacing={5}>
          <ListItem>Стоимость: 65 USD / персона</ListItem>
          <ListItem>
            Подробнее о мастер-классе можно посмотреть здесь: 
            <Link color='teal.600' fontWeight='500' ml={3} target="blank" href="https://www.instagram.com/reel/C0WcI86LSbY/?utm_source=ig_web_copy_link&igshid=MzRlODBiNWFlZA==">
              cсылка
            </Link>
          </ListItem>
        </List>
        <Link href="/tours/masterclass/">
            <Button ml={3} mb={'20px'} colorScheme="teal" size={["sm", null, "md", "lg"]}>
              &lt; Назад
            </Button>
          </Link>
      </Container>
    </>
  );
}

export default Fileteado;
