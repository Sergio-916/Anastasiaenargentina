"use client";

import { Box, Flex, Link, Container, Text, Stack } from "@chakra-ui/react";
import NextLink from "next/link";
import { menuItems, menuRoures } from "./Header";
import { FaInstagram, FaFacebook, FaWhatsapp, FaYoutube } from "react-icons/fa";

function Footer() {
  return (
    <>
      <Box w="100%" bgColor="blackAlpha.800" h="auto" color="whiteAlpha.900" >
        <Container maxW="container.xl" py="15px">
          <Flex justify="space-between" gap="10px" >
            <Box
              display="flex"
              w="50%"
              flexDirection="column"
              justifyContent="space-between"
            >
              <Box>
                <Text mb="30px" fontSize={["xl", "xl", "2xl"]}>
                  Анастасия Шимук - гид по Аргентине
                </Text>
              </Box>
              <Box>
                <Text fontSize={["sm", "md", "xl"]} mb={2}>
                  anastasiaenargentina@gmail.com
                </Text>
                <Text fontSize="small"> Copyright © 2024 Анастасия Шимук</Text>
              </Box>
            </Box>

            <Flex
              w="50%"
              direction={["row", "row", "column", null]}
              justify={{ base: "space-around", md: "space-between" }}
              align={{ base: "start", md: "end" }}
            >
              <Flex
                gap="20px"
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
                gap="20px"
                align={["center", "center", null, null]}
              >
                <Link
                  as={NextLink}
                  href="https://www.instagram.com/anastasiaenargentina/"
                  target="blank"
                >
                  <FaInstagram color="white" size={40} />
                </Link>
                <Link
                  as={NextLink}
                  href="https://www.facebook.com/anastasia.shimuk"
                  target="blank"
                >
                  <FaFacebook size={40} />
                </Link>
                <Link
                  as={NextLink}
                  href="https://www.youtube.com/@AnastasiaEnArgentina"
                  target="blank"
                >
                  <FaYoutube size={40} />
                </Link>
                <Link
                  as={NextLink}
                  href="https://api.whatsapp.com/send/?phone=541127588458&text=%D0%9F%D1%80%D0%B8%D0%B2%D0%B5%D1%82%21+%D0%9C%D0%B5%D0%BD%D1%8F+%D0%B8%D0%BD%D1%82%D0%B5%D1%80%D0%B5%D1%81%D1%83%D0%B5%D1%82+%D1%8D%D0%BA%D1%81%D0%BA%D1%83%D1%80%D1%81%D0%B8%D1%8F&type=phone_number&app_absent=0"
                  target="blank"
                >
                  <FaWhatsapp color="white" size={40} />
                </Link>
              </Stack>
            </Flex>
          </Flex>
        </Container>
      </Box>
    </>
  );
}

export default Footer;
