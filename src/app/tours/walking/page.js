"use client";
import {
  Container,
  Flex,
  Text,
  Heading,
  LinkOverlay,
  LinkBox,
  Box,
  UnorderedList,
  ListItem
} from "@chakra-ui/react";
import { useBreakpointValue } from "@chakra-ui/react";
import walkingData from "./walking.menu.json";



function Walking() {
  const cardLocation = useBreakpointValue({
    base: "center",
    sm: "center",
    md: "center",
    gl: 'start',
    xl: "start",
  });

  return (
    <>
      <Container maxW="container.xl">
        <Text
          my={[5, 6, 7, 9]}
          textAlign="center"
          fontSize={["2xl", null, "4xl", "4xl", "5xl"]}
        >
          Варианты пешеходных экскурсий
        </Text>
        <Flex gap={[5, null, 10]} wrap="wrap" justify={cardLocation}>
          {walkingData.header.map((item, index) => (
            <LinkBox
              key={index}
              as="article"
              fontSize={["lg", "xl"]}
              w={['md', 'xl', null, null, "lg",'xl']}
              p="5"
              borderWidth="1px"
              rounded="md"
            >
              <Box>{item}</Box>
              <Heading size={["md", "lg"]} my="2" fontSize={["lg", "xl"]}>
                <LinkOverlay href={`/tours/walking/${index + 1}`}>
                  {walkingData.title[index]}
                </LinkOverlay>
              </Heading>
              <UnorderedList mb="2" fontSize={['md',"lg", "xl"]}>
                {walkingData.details[`${index + 1}`].map((item) => (
                  <ListItem key={item}>{item}</ListItem>
                ))}
              </UnorderedList>
              <Box fontSize={["lg", "xl"]} color="teal.500" fontWeight="bold">
                Подробнее...
              </Box>
            </LinkBox>
          ))}
        </Flex>
        <Text   fontSize={["2xl", null, "3xl"]} mt={10} mb={4}>
          Опции
        </Text>
        <Box
          borderWidth="1px"
          rounded="md"
          boxShadow="xl"
          lineHeight="taller"
          padding={2}
          mb={10}
          
        >
          <Text _before={{ content: '"✅  "', mr: "5px" }} fontSize={['md', 'lg', 'xl']}>
            Длительность одного маршрута – 2 часа
          </Text>
          <Text _before={{ content: '"✅  "', mr: "5px" }} fontSize={['md', 'lg', 'xl']}>
            Вы можете объединить 2 маршрута, мы будем гулять 4 часа и сделаем
            паузу на кофе
          </Text>
          <Text _before={{ content: '"✅  "', mr: "5px" }} fontSize={['md', 'lg', 'xl']}>
            Вы можете выбрать 3 маршрута, прогулка будет продолжаться 8 часов с
            паузой на обед и кофе
          </Text>
          <Text _before={{ content: '"✅  "', mr: "5px" }} fontSize={['md', 'lg', 'xl']}>
            Я люблю город и нестандартные маршруты. Напишите ваши пожелания, и я
            составлю программу под вас
          </Text>
          <Text _before={{ content: '"⛔  "', mr: "5px" }} fontSize={['md', 'lg', 'xl']}>
            Есть «НО»! Я не вожу экскурсии в опасных районах, вижах, заброшенных
            зданиях и захваченных домах
          </Text>
          <Text _before={{ content: '"✅  "', mr: "5px" }} fontSize={['md', 'lg', 'xl']}>
            Зато я знаю, где лучший 5 o’clock tea в Буэнос Айресе, лучшие виды
            на город, нестандартные музеи и галереи
          </Text>
        </Box>
      </Container>
    </>
  );
}

export default Walking;
