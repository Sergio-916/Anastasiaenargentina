import { notFound } from "next/navigation";
import { Box } from "@chakra-ui/react";

import EventsInstagramTitle from "@/app/components/Events/EventsInstagramTitle";
import { getBackendUrl } from "@/utils/settings";

export const dynamic = "force-dynamic";

async function fetchEvents() {
  const res = await fetch(`${getBackendUrl()}/api/v1/events/`, {
    cache: "no-store",
  });

  if (res.status === 404) return null;
  if (!res.ok) throw new Error("Failed to fetch events");

  return res.json();
}

function getShortTermDateRange(events) {
  const weekStart = getInstagramWeekStart();
  const shortTermEvents = events.filter(
    (event) =>
      !event.is_long_term &&
      (event.end_date || event.start_date) >= weekStart,
  );

  if (!shortTermEvents.length) {
    return null;
  }

  const dates = shortTermEvents.flatMap((event) => [
    event.start_date,
    event.end_date || event.start_date,
  ]);

  return {
    startDate: weekStart,
    endDate: dates.reduce((max, date) => (date > max ? date : max)),
  };
}

function getInstagramWeekStart() {
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const day = today.getDay();
  const daysFromMonday = day === 0 ? -1 : day - 1;
  const weekStart = new Date(today);
  weekStart.setDate(today.getDate() - daysFromMonday);

  return weekStart.toISOString().slice(0, 10);
}

export default async function InstagramTitlePage() {
  const eventsData = await fetchEvents();
  const dateRange = eventsData
    ? getShortTermDateRange(eventsData.data || [])
    : null;

  if (!dateRange) {
    notFound();
  }

  return (
    <Box w="1080px" h="1350px" overflow="hidden">
      <EventsInstagramTitle
        startDate={dateRange.startDate}
        endDate={dateRange.endDate}
      />
    </Box>
  );
}
