"use client";

import {
  Badge,
  Box,
  Button,
  Flex,
  Heading,
  HStack,
  Image,
  Link,
  Stack,
  Text,
  VStack,
} from "@chakra-ui/react";
import { useMemo, useState } from "react";
import { A11y, Navigation, Pagination, Scrollbar } from "swiper/modules";
import { Swiper, SwiperSlide } from "swiper/react";
import "swiper/css";
import "swiper/css/navigation";
import "swiper/css/pagination";
import "swiper/css/scrollbar";

const EVENT_TYPES = {
  short: "short",
  long: "long",
};

function formatDateRange(event) {
  const startDate = new Date(`${event.start_date}T00:00:00`);
  const endDate = event.end_date ? new Date(`${event.end_date}T00:00:00`) : null;
  const dateFormatter = new Intl.DateTimeFormat("ru-RU", {
    day: "numeric",
    month: "long",
    year: "numeric",
  });

  if (!endDate || event.start_date === event.end_date) {
    return dateFormatter.format(startDate);
  }

  return `${dateFormatter.format(startDate)} - ${dateFormatter.format(endDate)}`;
}

function isUpcomingEvent(event) {
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const relevantDate = new Date(`${event.end_date || event.start_date}T00:00:00`);
  return relevantDate >= today;
}

function formatTime(event) {
  if (!event.start_time_local && !event.end_time_local) {
    return null;
  }
  if (event.start_time_local && event.end_time_local) {
    return `${event.start_time_local} - ${event.end_time_local}`;
  }
  return event.start_time_local || event.end_time_local;
}

function formatPrice(event) {
  if (event.price_type === "free") {
    return "Бесплатно";
  }
  if (event.price_value) {
    return `${event.price_value} ${event.price_currency || ""}`.trim();
  }
  if (event.price_type === "paid") {
    return "Платно";
  }
  return "Уточните цену";
}

function EventCard({ event }) {
  const eventTime = formatTime(event);

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
          <Flex wrap="wrap" gap={2} align="center">
            <Badge colorScheme="teal" fontSize="0.8em" px={3} py={1} borderRadius="full">
              {event.category}
            </Badge>
            <Badge colorScheme={event.is_long_term ? "purple" : "orange"} px={3} py={1} borderRadius="full">
              {event.is_long_term ? "Долгосрочное" : "Ближайшее"}
            </Badge>
          </Flex>

          <Heading as="h2" size={{ base: "md", md: "lg" }} color="teal.900">
            {event.title}
          </Heading>

          <Box w={{ base: "100%", md: "45%" }} bg="teal.50">
            <Image
              src={event.image_primary_url || "/opengraph/Dios.jpg"}
              alt={event.image_alt || event.title}
              objectFit="cover"
              w="100%"
              h={{ base: "260px", md: "100%" }}
            />
          </Box>
          <Stack spacing={1} fontSize={{ base: "sm", md: "md" }} color="gray.700">
            <Text fontWeight="700">📅 {formatDateRange(event)}</Text>
            {eventTime && <Text>🕒 {eventTime}</Text>}
            {event.venue_name && <Text>📍 {event.venue_name}</Text>}
            {event.neighborhood && <Text>🏙️ {event.neighborhood}</Text>}
            <Text>🎟️ {formatPrice(event)}</Text>
          </Stack>

          <Text fontSize={{ base: "md", md: "lg" }} color="gray.800">
            {event.summary_long}
          </Text>

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
                >
                  Приобрести билеты на сайте
                </Link>
              </HStack>
            )}
            {event.official_url && (
              <HStack gap={2}>
                <Text>
                  👉
                </Text>
                <Link
                  href={event.official_url}
                  target="_blank"
                  color="teal.600"
                  fontWeight="400"
                  textDecoration="underline"
                >
                 Подробнее на официальном сайте
                </Link>
              </HStack>
            )}
          </VStack>

          {event.tags?.length > 0 && (
            <Flex gap={2} wrap="wrap" pt={2} mt="auto">
              {event.tags.map((tag) => (
                <Badge key={tag} colorScheme="gray" variant="subtle" borderRadius="full" px={3} py={1}>
                  #{tag}
                </Badge>
              ))}
            </Flex>
          )}
        </Stack>
      </Flex>
    </Box>
  );
}

export default function EventsCarousel({ events }) {
  const [eventType, setEventType] = useState(EVENT_TYPES.short);

  const filteredEvents = useMemo(
    () =>
      events.filter((event) => {
        const isSelectedType =
          eventType === EVENT_TYPES.long ? event.is_long_term : !event.is_long_term;
        return isSelectedType && isUpcomingEvent(event);
      }),
    [eventType, events]
  );

  return (
    <Box mt={4}>
      <Flex justify="center" gap={{ base: 3, md: 5 }} mb={5} wrap="wrap">
        <Button
          colorScheme="teal"
          size={'sm'}
          variant={eventType === EVENT_TYPES.short ? "solid" : "outline"}
          onClick={() => setEventType(EVENT_TYPES.short)}
        >
          Ближайшие
        </Button>
        <Button
          colorScheme="teal"
          size={'sm'}
          variant={eventType === EVENT_TYPES.long ? "solid" : "outline"}
          onClick={() => setEventType(EVENT_TYPES.long)}
        >
          Долгосрочные
        </Button>
      </Flex>

      {filteredEvents.length === 0 ? (
        <Text textAlign="center" fontSize={["md", "lg"]} color="gray.600">
          Пока нет событий в этой категории.
        </Text>
      ) : (
        <Swiper
          key={eventType}
          modules={[Navigation, Pagination, Scrollbar, A11y]}
          slidesPerView={1}
          spaceBetween={30}
          pagination={{ clickable: true }}
          scrollbar={{ draggable: true }}
        >
          {filteredEvents.map((event) => (
            <SwiperSlide key={event.slug} style={{ padding: "0 0 42px" }}>
              <EventCard event={event} />
            </SwiperSlide>
          ))}
        </Swiper>
      )}
    </Box>
  );
}
