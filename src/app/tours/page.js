import { Container, Heading, SimpleGrid } from "@chakra-ui/react";

import CardMenu from "../components/Cards/Card.menu";

export const metadata = {
  title: "Варианты экскурсий",
  description: "Пешеходные экскурсии по Буэнос Айресу, автомобильные экскурсии, поездки по Аргентине",
};

function Tours() {
  return (
    <>
      <Container maxW="container.xl">
        <Heading my="20px" textAlign="center" size="xl">
          Экскурсии
        </Heading>
        <SimpleGrid columns={{ base: 1, md: 2 }} spacing={10}>
          <CardMenu />
        </SimpleGrid>
      </Container>
    </>
  );
}

export default Tours;
