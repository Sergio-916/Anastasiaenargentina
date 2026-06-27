"use client";

import { Box, Button, Flex, Text } from "@chakra-ui/react";
import { useState } from "react";
import { A11y, Navigation, Pagination, Scrollbar } from "swiper/modules";
import { Swiper, SwiperSlide } from "swiper/react";

import EventCard from "./EventCard";
import {
  EVENT_TYPES,
  filterEventsByType,
  getEventTypeForSlug,
} from "./eventFilters";

import "swiper/css";
import "swiper/css/navigation";
import "swiper/css/pagination";
import "swiper/css/scrollbar";

export default function EventsCarousel({ events, initialSlug }) {
  const [eventType, setEventType] = useState(() =>
    initialSlug ? getEventTypeForSlug(events, initialSlug) : EVENT_TYPES.short,
  );

  const filteredEvents = filterEventsByType(events, eventType);
  const initialSlide = Math.max(
    0,
    filteredEvents.findIndex((event) => event.slug === initialSlug),
  );
  const updateBrowserUrl = (event) => {
    if (!event?.slug) {
      window.history.replaceState(null, "", "/events");
      return;
    }

    window.history.replaceState(
      null,
      "",
      `/events/${encodeURIComponent(event.slug)}`,
    );
  };

  return (
    <Box mt={4}>
      <Flex justify="center" gap={{ base: 3, md: 5 }} mb={5} wrap="wrap">
        <Button
          colorScheme="teal"
          size={"sm"}
          variant={eventType === EVENT_TYPES.short ? "solid" : "outline"}
          onClick={() => setEventType(EVENT_TYPES.short)}
        >
          Ближайшие
        </Button>
        <Button
          colorScheme="teal"
          size={"sm"}
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
          initialSlide={initialSlide}
          slidesPerView={1}
          spaceBetween={30}
          pagination={{ clickable: true }}
          scrollbar={{ draggable: true }}
          preventClicks={false}
          preventClicksPropagation={false}
          onSwiper={(swiper) => updateBrowserUrl(filteredEvents[swiper.activeIndex])}
          onSlideChange={(swiper) => updateBrowserUrl(filteredEvents[swiper.activeIndex])}
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
