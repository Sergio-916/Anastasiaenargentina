"use client";

import {
  Box,
  Button,
  Container,
  Flex,
  Image,
  Text,
  Link,
  Divider,
  theme,
  Heading
} from "@chakra-ui/react";
import { useBreakpointValue } from "@chakra-ui/react";
import NextLink from "next/link";
import MySwiperComponent from "./components/Carousel";

export default function Home() {
  const nastyaPhoto = "/nastya.jpg";

  const variant = useBreakpointValue({
    base: "column-reverse",
    md: "row",
    gl: "row",
    xl: "row",
  });
  const variantW = useBreakpointValue({
    base: "100%",
    md: "50%",
    gl: "50%",
    xl: "50%",
  });

  return (
    <>
      
      <Container maxW="container.xl">
        <Flex
          gap="30px"
          mt="10px"
          justifyContent="space-around"
          flexDirection={variant}
          align={{ base: "center", md: null }}
        >
          <Box w={variantW}>
            <Box
              mt="30px"
              textAlign="center"
              display="flex"
              alignItems="center"
              flexDirection="column"
            >
              <Image
                mt={{ md: "20px" }}
                src={nastyaPhoto}
                alt="Anastasia_Shimuk"
                w="360px"
                borderRadius="xl"
              />
              <Text lineHeight="taller" as="i" fontSize={["xl", "xl", "2xl"]}>
                “ Делюсь любовью к неидеальной Аргентине “
              </Text>
            </Box>
          </Box>
          <Box
            boxShadow="xl"
            borderRadius="xl"
            textColor="gray.600"
            textAlign="center"
            bg="gray.50"
            w={{ base: "400px", md: "50%" }}
            display="flex"
            flexDirection="column"
            alignItems="center"
            justifyContent="space-around"
            minH={"600px"}
            pt={{ md: 10 }}
            pl={{ base: 25 }}
            pr={{ base: 25 }}
          >
            <Heading fontSize={["2xl", "3xl", "4xl", "5xl"]} lineHeight="shorter">
              Анастасия Шимук - гид по Аргентине
            </Heading>
            <Text as="b" fontSize={["lg", "xl", "xl", "2xl"]}>
              Экскурсии по Буэнос Айресу, история города и выдающихся людей,
              эксклюзивные и увлекательные поездки по Аргентине
            </Text>
            <Link as={NextLink} href="/tours">
              <Button colorScheme="teal" size="lg">
                Экскурсии
              </Button>
            </Link>
          </Box>
        </Flex>
      </Container>

      <Container maxW="container.xl">
        <Divider />
        <Text
          fontSize={["3xl", "4xl", "5xl"]}
          textAlign="center"
          mt={20}
          mb={-10}
        >
          Отзывы
        </Text>
        <Flex justify="center">
          <MySwiperComponent />
        </Flex>
      </Container>
    </>
  );
}
