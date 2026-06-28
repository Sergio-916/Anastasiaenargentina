import { Container, Heading, Text } from "@chakra-ui/react";
import { notFound } from "next/navigation";

import EventsCarousel from "../components/Events/EventsCarousel";
import { getBackendUrl } from "@/utils/settings";

export const dynamic = "force-dynamic";

export const metadata = {
  title: "События в Буэнос-Айресе | Афиша для путешественников",
  description:
    "Актуальная афиша Буэнос-Айреса: концерты, выставки, спектакли, опера и долгосрочные культурные события для путешественников.",
  keywords: [
    "события Буэнос-Айрес",
    "афиша Буэнос-Айрес",
    "концерты Буэнос-Айрес",
    "выставки Буэнос-Айрес",
    "куда сходить в Буэнос-Айресе",
  ],
  alternates: {
    canonical: "/events",
  },
  openGraph: {
    title: "События в Буэнос-Айресе",
    description:
      "Концерты, выставки, спектакли и культурные события Буэнос-Айреса для тех, кто хочет увидеть город глубже.",
    url: "https://anastasiashimuk.com/events",
    type: "website",
  },
};

async function fetchEvents() {
  try {
    const res = await fetch(`${getBackendUrl()}/api/v1/events/`, {
      cache: "no-store",
    });

    if (res.status === 404) {
      return null;
    }

    if (!res.ok) {
      const body = await res.text().catch(() => "");
      throw new Error(
        `Failed to fetch events: ${res.status} ${body.slice(0, 200)}`,
      );
    }

    return await res.json();
  } catch (error) {
    console.error("Error fetching events:", error);
    return { data: [], count: 0 };
  }
}

export default async function EventsPage() {
  const eventsData = await fetchEvents();
  if (!eventsData) {
    notFound();
  }

  const events = eventsData.data || [];

  return (
    <Container maxW="container.xl" minH="70vh">
      <Text m={3} fontSize={["md", "lg", "xl"]} textAlign="center">
        Подборка концертов, выставок, спектаклей и культурных событий в
        Буэнос-Айресе.
      </Text>
      <EventsCarousel events={events} />
    </Container>
  );
}
