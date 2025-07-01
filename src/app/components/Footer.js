"use client";

import { Box, Flex, Link, Container, Text, Stack } from "@chakra-ui/react";
import NextLink from "next/link";
import { menuItems, menuRoures } from "./Header";
import { FaInstagram, FaFacebook, FaWhatsapp, FaYoutube } from "react-icons/fa";

function Footer() {
  return (
    <>
      <Box w="100%" bgColor="blackAlpha.800" h="auto" color="whiteAlpha.900">
        <Container maxW="container.xl" py="15px">
          <Flex justify="space-between" gap="10px">
            <Box
              display="flex"
              w="50%"
              flexDirection="column"
              justifyContent="space-between"
            >
              <Box>
                <Text mb="30px" fontSize={["lg", "lg", "xl"]}>
                  Анастасия Шимук - гид по Аргентине
                </Text>
              </Box>
              <Box>
                <Text
                  fontSize={["sm", "md", "xl"]}
                  mb={2}
                  wordBreak="break-word"
                  overflowWrap="break-word"
                  whiteSpace="normal"
                >
                  anastasiaenargentina@gmail.com
                </Text>
                <Text fontSize="small"> Copyright © 2025 Анастасия Шимук</Text>
              </Box>
            </Box>

            <Flex
              w="50%"
              direction={["row", "row", "column", null]}
              justify={{ base: "space-around", md: "space-between" }}
              align={{ base: "start", md: "end" }}
            >
              <Flex
                gap={["12px", "12px", "20px", "20px"]}
                justify={{ base: "start", md: "end" }}
                direction={["column", null, "row", "row"]}
              >
                {menuItems.map((item, index) => (
                  <Link key={index} as={NextLink} href={menuRoures[index]}>
                    {item}
                  </Link>
                ))}
              </Flex>

              <Stack
                direction={["column", null, "row", "row"]}
                justify={["end"]}
                gap={["12px", "12px", "20px", "20px"]}
                align={["center", "center", null, null]}
              >
                <Link
                  as={NextLink}
                  href="https://www.instagram.com/anastasiaenargentina/"
                  target="blank"
                >
                  <Box
                    color="white"
                    fontSize={["30px", "30px", "40px", "40px"]}
                  >
                    <FaInstagram />
                  </Box>
                </Link>
                <Link
                  as={NextLink}
                  href="https://www.facebook.com/anastasia.shimuk"
                  target="blank"
                >
                  <Box
                    color="white"
                    fontSize={["30px", "30px", "40px", "40px"]}
                  >
                    <FaFacebook />
                  </Box>
                </Link>
                <Link
                  as={NextLink}
                  href="https://www.youtube.com/@AnastasiaEnArgentina"
                  target="blank"
                >
                  <Box
                    color="white"
                    fontSize={["30px", "30px", "40px", "40px"]}
                  >
                    <FaYoutube />
                  </Box>
                </Link>
                <Link
                  as={NextLink}
                  href="https://api.whatsapp.com/send/?phone=541127588458&text=%D0%9F%D1%80%D0%B8%D0%B2%D0%B5%D1%82%21+%D0%9C%D0%B5%D0%BD%D1%8F+%D0%B8%D0%BD%D1%82%D0%B5%D1%80%D0%B5%D1%81%D1%83%D0%B5%D1%82+%D1%8D%D0%BA%D1%81%D0%BA%D1%83%D1%80%D1%81%D0%B8%D1%8F&type=phone_number&app_absent=0"
                  target="blank"
                >
                  <Box
                    color="white"
                    fontSize={["30px", "30px", "40px", "40px"]}
                  >
                    <FaWhatsapp />
                  </Box>
                </Link>
              </Stack>
            </Flex>
          </Flex>
          <Box textAlign="right" mt="10px">
            <Text fontSize="xs">Created by @ Sergey Shpak</Text>
          </Box>
        </Container>
      </Box>
    </>
  );
}

export default Footer;
