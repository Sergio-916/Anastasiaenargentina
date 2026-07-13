import { notFound } from "next/navigation";
import { Container, Text } from "@chakra-ui/react";

import EventsCarousel from "@/app/components/Events/EventsCarousel";
import { getBackendUrl } from "@/utils/settings";

export const dynamic = "force-dynamic";

async function fetchEvent(slug) {
  try {
    const res = await fetch(
      `${getBackendUrl()}/api/v1/events/${encodeURIComponent(slug)}`,
      {
        cache: "no-store",
      },
    );

    if (res.status === 404) {
      return null;
    }

    if (!res.ok) {
      const body = await res.text().catch(() => "");
      throw new Error(
        `Failed to fetch event: ${res.status} ${body.slice(0, 200)}`,
      );
    }

    return await res.json();
  } catch (error) {
    console.error("Error fetching event:", error);
    return null;
  }
}

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

export async function generateMetadata({ params }) {
  const { slug } = params;
  const event = await fetchEvent(slug);
  const canonicalPath = `/events/${encodeURIComponent(slug)}`;

  if (!event) {
    return {
      title: "Событие не найдено",
      description: "Запрошенное событие не существует.",
      alternates: {
        canonical: canonicalPath,
      },
      robots: {
        index: false,
        follow: false,
      },
    };
  }

  const description = event.summary_short || event.summary_long || event.title;

  return {
    title: `${event.title} | События в Буэнос-Айресе`,
    description,
    alternates: {
      canonical: canonicalPath,
    },
    openGraph: {
      title: event.title,
      description,
      url: canonicalPath,
      type: "article",
      images: event.image_primary_url
        ? [
            {
              url: event.image_primary_url,
              alt: event.image_alt || event.title,
            },
          ]
        : undefined,
    },
    twitter: {
      card: "summary_large_image",
      title: event.title,
      description,
    },
  };
}

export default async function EventPage({ params }) {
  const { slug } = params;
  const eventsData = await fetchEvents();

  if (!eventsData) {
    notFound();
  }

  const events = eventsData.data || [];
  const event = events.find((item) => item.slug === slug);

  if (!event) {
    notFound();
  }

  return (
    <Container maxW="container.xl" minH="70vh">
      <Text m={3} fontSize={["md", "lg", "xl"]} textAlign="center">
        Подборка концертов, выставок, спектаклей и культурных событий в
        Буэнос-Айресе.
      </Text>
      <EventsCarousel events={events} initialSlug={slug} />
    </Container>
  );
}
