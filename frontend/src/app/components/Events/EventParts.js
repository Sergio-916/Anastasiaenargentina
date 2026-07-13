import {
  Badge,
  Flex,
  HStack,
  Link,
  Stack,
  Text,
  VStack,
} from "@chakra-ui/react";

import { formatDateRange, formatPrice, formatTime } from "./eventFormatters";

export function EventBadges({ event }) {
  return (
    <Flex wrap="wrap" gap={2} align="center">
      <Badge
        colorScheme="teal"
        fontSize="0.8em"
        px={3}
        py={1}
        borderRadius="full"
      >
        {event.category}
      </Badge>
      <Badge
        colorScheme={event.is_long_term ? "purple" : "orange"}
        px={3}
        py={1}
        borderRadius="full"
      >
        {event.is_long_term ? "Долгосрочное" : "Ближайшее"}
      </Badge>
    </Flex>
  );
}

export function EventMeta({ event, showAddress = false, ...props }) {
  const eventTime = formatTime(event);

  return (
    <Stack
      spacing={1}
      fontSize={{ base: "sm", md: "md" }}
      color="gray.700"
      {...props}
    >
      <Text fontWeight="700">📅 {formatDateRange(event)}</Text>
      {eventTime && <Text>🕒 {eventTime}</Text>}
      {event.venue_name && <Text>📍 {event.venue_name}</Text>}
      {showAddress && event.venue_address && (
        <Text>Адрес: {event.venue_address}</Text>
      )}
      {event.neighborhood && <Text>🏙️ {event.neighborhood}</Text>}
      <Text>🎟️ {formatPrice(event)}</Text>
    </Stack>
  );
}

export function EventLinks({ event, includeRel = false }) {
  const relProps = includeRel ? { rel: "noopener noreferrer" } : {};

  if (!event.ticket_url && !event.official_url) {
    return null;
  }

  return (
    <VStack gap={3} align="flex-start">
      {event.ticket_url && (
        <HStack gap={2}>
          <Text>🎟️</Text>
          <Link
            href={event.ticket_url}
            target="_blank"
            color="teal.600"
            fontWeight="400"
            textDecoration="underline"
            {...relProps}
          >
            Приобрести билеты на сайте
          </Link>
        </HStack>
      )}
      {event.official_url && (
        <HStack gap={2}>
          <Text>👉</Text>
          <Link
            href={event.official_url}
            target="_blank"
            color="teal.600"
            fontWeight="400"
            textDecoration="underline"
            {...relProps}
          >
            Подробнее на официальном сайте
          </Link>
        </HStack>
      )}
    </VStack>
  );
}

export function EventTags({ tags, pt = 2, mt }) {
  if (!tags?.length) {
    return null;
  }

  return (
    <Flex gap={2} wrap="wrap" pt={pt} mt={mt}>
      {tags.map((tag) => (
        <Badge
          key={tag}
          colorScheme="gray"
          variant="subtle"
          borderRadius="full"
          px={3}
          py={1}
        >
          #{tag}
        </Badge>
      ))}
    </Flex>
  );
}
