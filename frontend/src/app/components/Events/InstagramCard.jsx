import {
  Badge,
  Box,
  Flex,
  Heading,
  Image,
  Stack,
  Text,
} from "@chakra-ui/react";

import { formatDateRange, formatPrice, formatTime } from "./eventFormatters";

function getTitleFontSize(title) {
  if (title.length > 70) {
    return "4xl";
  }
  if (title.length > 40) {
    return "5xl";
  }
  return "6xl";
}

function getSummaryFontSize(summary) {
  if (summary.length > 150) {
    return "2xl";
  }
  if (summary.length > 105) {
    return "2xl";
  }
  return "3xl";
}

function getDescriptionLineCount(description) {
  if (description.length > 340) {
    return 8;
  }
  if (description.length > 220) {
    return 6;
  }
  return 4;
}

export default function InstagramCard({ event }) {
  const eventTime = formatTime(event);
  const tags = event.tags?.slice(0, 4) || [];
  const titleLength = event.title?.length || 0;
  const summaryShortLength = event.summary_short?.length || 0;
  const isDenseHeader = titleLength > 45 || summaryShortLength > 105;

  return (
    <Box
      as="article"
      w="full"
      h="full"
      bg="#f7fbfa"
      color="gray.900"
      overflow="hidden"
      display="flex"
      flexDirection="column"
    >
      <Box bg="teal.600" color="white" px={16} py={7} flexShrink={0}>
        <Text fontSize="3xl" fontWeight="700">
          Anastasia en Argentina
        </Text>
      </Box>

      <Stack
        spacing={isDenseHeader ? 4 : 5}
        px={18}
        pt={isDenseHeader ? 8 : 10}
        pb={7}
        flex="1"
        minH={0}
      >
        <Flex gap={4} wrap="wrap">
          <Badge
            bg="teal.100"
            color="teal.900"
            borderRadius="full"
            px={5}
            py={2}
            fontSize="xl"
          >
            {event.category}
          </Badge>
          <Badge
            bg={event.is_long_term ? "purple.100" : "orange.100"}
            color={event.is_long_term ? "purple.900" : "orange.900"}
            borderRadius="full"
            px={5}
            py={2}
            fontSize="xl"
          >
            {event.is_long_term ? "Долгосрочное" : "Ближайшее"}
          </Badge>
        </Flex>

        <Heading
          as="h1"
          color="teal.950"
          fontSize={getTitleFontSize(event.title || "")}
          lineHeight="shorter"
          letterSpacing="0"
          noOfLines={3}
        >
          {event.title}
        </Heading>

        <Text
          fontSize={getSummaryFontSize(event.summary_short || "")}
          lineHeight="short"
          color="gray.800"
          fontWeight="500"
          noOfLines={3}
        >
          {event.summary_short}
        </Text>

        <Box
          w="100%"
          flex="1"
          minH="220px"
          bg="#f7fbfa"
          display="flex"
          justifyContent="center"
          alignItems="center"
          overflow="hidden"
        >
          <Image
            src={event.image_primary_url}
            alt={event.image_alt || event.title}
            objectFit="contain"
            w="100%"
            h="100%"
            boxShadow="0 18px 40px rgba(15, 118, 110, 0.18)"
          />
        </Box>

        <Box
          bg="white"
          borderWidth="2px"
          borderColor="teal.100"
          borderRadius="xl"
          px={5}
          py={4}
          flexShrink={0}
        >
          <Stack spacing={1} fontSize="xl" color="gray.800" lineHeight="short">
            <Text fontWeight="800">📅 {formatDateRange(event)}</Text>
            {eventTime && <Text>🕒 {eventTime}</Text>}
            {event.venue_name && <Text>📍 {event.venue_name}</Text>}
            {event.neighborhood && <Text>🏙️ {event.neighborhood}</Text>}
            <Text>🎟️ {formatPrice(event)}</Text>
          </Stack>
        </Box>

        <Text
          fontSize="2xl"
          lineHeight="short"
          color="gray.800"
          noOfLines={getDescriptionLineCount(event.summary_long || "")}
          flexShrink={0}
        >
          {event.summary_long}
        </Text>
      </Stack>

      <Flex
        px={18}
        py={10}
        minH="11%"
        flexShrink={0}
        justify="space-between"
        align="flex-end"
        gap={6}
        borderTopWidth="1px"
        borderTopColor="teal.100"
        bg="#f7fbfa"
      >
        <Flex gap={3} wrap="wrap" maxW="70%">
          {tags.map((tag) => (
            <Badge
              key={tag}
              bg="gray.100"
              color="gray.800"
              borderRadius="full"
              px={4}
              py={2}
              fontSize="xl"
              textTransform="none"
            >
              #{tag}
            </Badge>
          ))}
        </Flex>

        <Stack spacing="2px" align="flex-end" color="teal.900">
          <Text fontSize="2xl" fontWeight="800">
            anastasiaenargentina
          </Text>
          <Text fontSize="lg">Гид по Буэнос-Айресу</Text>
        </Stack>
      </Flex>
    </Box>
  );
}
