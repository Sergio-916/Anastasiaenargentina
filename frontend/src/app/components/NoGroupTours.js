"use client";

import NextLink from "next/link";
import {
  Container,
  Heading,
  Box,
  Text,
  Link,
  VStack,
  Stack,
  Image,
} from "@chakra-ui/react";
import { FaInstagram, FaFacebook, FaWhatsapp, FaYoutube } from "react-icons/fa";

export default function NoGroupTours() {
  return (
    <Container maxW="container.lg" minH={["none", "none", "75vh"]} py={10}>
      <VStack spacing={8} align="center" textAlign="center">
        <Box
          borderRadius="lg"
          overflow="hidden"
          boxShadow="xl"
          maxW="400px"
          w="100%"
        >
          <Image
            src="/no_tours.png"
            alt="no_tours"
            objectFit="cover"
            w="100%"
            h="auto"
          />
        </Box>
        
        <VStack spacing={4} maxW="600px">
          <Heading size="lg" color="gray.700">
            К сожалению, в ближайшее время групповых экскурсий не запланировано
          </Heading>
          <Text fontSize="lg" color="gray.600" lineHeight="tall">
            Следите за обновлениями в наших социальных сетях, чтобы не пропустить новые даты экскурсий!
          </Text>
        </VStack>

        
      </VStack>
    </Container>
  );
}

