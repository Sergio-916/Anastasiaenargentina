"use client";

import {
  Box,
  Flex,
  Heading,
  Text,
  Link,
  Avatar,
  VStack,
  Divider,
  HStack,
} from "@chakra-ui/react";

export default function Taplink() {
  const buttonColor = "rgb(10,53,86)";
  const buttonColorHover = { bg: "rgb(40, 83, 116)" };

  const Galka = () => {
    return (
      <HStack my={-4}>
        <Box bgColor={buttonColor} width={"100px"} height={"1px"}></Box>
        <Text fontSize="40px">&#x25BE;</Text>
        <Box bgColor={buttonColor} width={"100px"} height={"1px"}></Box>
      </HStack>
    );
  };

  return (
    <Box
      bgColor="rgb(215,229,238)"
      bgSize="cover"
      bgPosition="center"
      minH="100vh"
    >
      <VStack spacing={8} align="center">
        <Box px={8} pt={8} borderRadius="lg" textAlign="center">
          <Avatar
            size="2xl"
            name="Anastasia Shimuk"
            src="/about_photos/about6.jpg"
            mb={4}
          />
          <Text size="sm" mb={2} textColor={buttonColor}>
            AnastasiaENArgentina
          </Text>
          <Heading
            as="h2"
            size="lg"
            fontWeight="bold"
            mb={2}
            color={buttonColor}
          >
            АНАСТАСИЯ ШИМУК
          </Heading>
          <Text fontSize="lg" mb={4} textColor={buttonColor}>
            прогулки по Буэнос Айресу, экскурсии в музеи
          </Text>
          <Divider borderColor="gray.400" px={2} />
        </Box>
        <Text color={buttonColor} mb={-2}>
          ЗАПИСЬ НА ЭКСКУРСИИ
        </Text>
        <Galka />
        <VStack spacing={4} w="full" maxW={{ base: "md", lg: "xl" }} px={4}>
          <Link
            href="http://wa.me/541127588458?text=Привет! Меня интересует экскурсия."
            isExternal
            w="full"
          >
            <Box
              as="button"
              w="full"
              p={4}
              bg={buttonColor}
              color="white"
              borderRadius="md"
              _hover={buttonColorHover}
            >
              What’s up
            </Box>
          </Link>
          <Divider borderColor="gray.400" px={2} />
          <Link
            href="https://www.facebook.com/anastasia.shimuk"
            isExternal
            w="full"
          >
            <Box
              as="button"
              w="full"
              p={4}
              bg={buttonColor}
              color="white"
              borderRadius="md"
              _hover={buttonColorHover}
            >
              Facebook
            </Box>
          </Link>
          <Link href="https://anastasiashimuk.com/" isExternal w="full">
            <Box
              as="button"
              w="full"
              p={4}
              bg={buttonColor}
              color="white"
              borderRadius="md"
              _hover={buttonColorHover}
            >
              Web site
            </Box>
          </Link>
        </VStack>
      </VStack>
    </Box>
  );
}
