import { Box, Flex, Heading, Image, Link, Stack, Text } from "@chakra-ui/react";
import NextLink from "next/link";

import { EventBadges, EventLinks, EventMeta, EventTags } from "./EventParts";

export default function EventCard({ event }) {
  const eventHref = `/events/${encodeURIComponent(event.slug)}`;

  return (
    <Box
      as="article"
      borderWidth="1px"
      borderColor="teal.100"
      borderRadius="2xl"
      overflow="hidden"
      bg="white"
      boxShadow="lg"
      maxW="920px"
      mx="auto"
    >
      <Flex direction={{ base: "column", md: "row" }} minH={{ md: "430px" }}>
        <Stack spacing={4} p={{ base: 5, md: 8 }} flex="1">
          <EventBadges event={event} />

          <Heading
            as="h2"
            size={{ base: "md", md: "lg" }}
            color="teal.900"
            textAlign={{ base: "left", md: "center" }}
          >
            {event.title}
          </Heading>
          <Text
            textAlign={{ base: "left", md: "center" }}
            fontSize={{ base: "md", md: "lg" }}
            color="gray.800"
          >
            {event.summary_short}
          </Text>

          <Box
            w="100%"
            overflow="hidden"
            display="flex"
            justifyContent="center"
            alignItems="center"
          >
            <Image
              src={event.image_primary_url}
              alt={event.image_alt || event.title}
              objectFit="contain"
              maxW={{ base: "350px", md: "md" }}
              w="100%"
              h="auto"
              maxH={{ base: "300px", md: "md" }}
              loading="lazy"
            />
          </Box>

          <EventMeta event={event} />

          <Text fontSize={{ base: "md", md: "lg" }} color="gray.800">
            {event.summary_long}
          </Text>

          <Stack gap={3} align="flex-start">
            <EventLinks event={event} />
          </Stack>

          <EventTags tags={event.tags} mt="auto" />
        </Stack>
      </Flex>
    </Box>
  );
}
