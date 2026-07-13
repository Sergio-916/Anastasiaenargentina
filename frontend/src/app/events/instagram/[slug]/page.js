import { notFound } from "next/navigation";
import { Box } from "@chakra-ui/react";

import InstagramCard from "@/app/components/Events/InstagramCard";
import { getBackendUrl } from "@/utils/settings";

export const dynamic = "force-dynamic";

async function fetchEvent(slug) {
  const res = await fetch(`${getBackendUrl()}/api/v1/events/${slug}`, {
    cache: "no-store",
  });

  if (res.status === 404) return null;
  if (!res.ok) throw new Error("Failed to fetch event");

  return res.json();
}

export default async function InstagramEventPage({ params }) {
  const event = await fetchEvent(params.slug);

  if (!event) {
    notFound();
  }

  return (
    <Box w="1080px" h="1350px" overflow="hidden" bg="#f7fbfa">
      <InstagramCard event={event} />
    </Box>
  );
}
