import {
  Box,
  Heading,
  Text,
  VStack,
  SimpleGrid,
  Container,
  Divider,
} from "@chakra-ui/react";

// Base URL for API calls
const getBaseUrl = () => process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000';

// Fetch tour by slug and date_id
async function fetchTour(slug, date_id) {
  const baseUrl = getBaseUrl();
  const res = await fetch(`${baseUrl}/api/tours/${slug}/${date_id}`, {
    cache: 'no-store',
  });

  if (!res.ok) {
    return null;
  }

  return await res.json();
}

// Fetch all scheduled tours
async function fetchScheduledTours() {
  const baseUrl = getBaseUrl();
  const res = await fetch(`${baseUrl}/api/tours`, {
    cache: 'no-store',
  });

  if (!res.ok) {
    return [];
  }

  return await res.json();
}

export async function generateMetadata({ params }) {
  const { slug, date_id } = params;
  const tour = await fetchTour(slug, date_id);

  if (!tour) {
    return {
      title: "Тур не найден",
      description: "Запрошенный тур не существует.",
    };
  }

  return {
    title: tour.name,
    description: tour.description,
  };
}

export async function generateStaticParams() {
  try {
    console.log("Generating static params for group tours...");
    const scheduledTours = await fetchScheduledTours();
    console.log(`Found ${scheduledTours.length} tour dates for static generation`);
    
    return scheduledTours.map((tour) => ({
      slug: tour.slug,
      date_id: String(tour.date_id),
    }));
  } catch (error) {
    console.error("Error generating static params:", error);
    return [];
  }
}

export default async function TourPage({ params }) {
  const { slug, date_id } = params;
  const tour = await fetchTour(slug, date_id);

  if (!tour) {
    return (
      <Container maxW="container.lg" mt={4}>
        <Text>Тур не найден</Text>
      </Container>
    );
  }

  const formatDate = (dateStr) => {
    const date = new Date(dateStr);
    return date.toLocaleDateString("ru-RU", {
      day: "numeric",
      month: "long",
    });
  };

  const formatHours = (minutes) => {
    const hours = Math.floor(minutes / 60);
    if (hours === 1) return `${hours} час`;

    return `${hours} часа`;
  };

  return (
    <Container maxW="container.lg" mt={4} minH={["none", "none", "75vh"]}>
      <Box>
        <SimpleGrid columns={[1, null, 2]} spacing={4}>
          <VStack align="start">
            <Heading size="lg">{tour.name}</Heading>
            <Text>⏱ Длительность: {formatHours(tour.duration)}</Text>
            {tour.max_capacity && (
              <Text>👥 Максимум: {tour.max_capacity} человек</Text>
            )}
            <Text>💸 Стоимость: {tour.cost}</Text>
            {tour.additional_cost && (
              <Text>Доп. расходы: {tour.additional_cost}</Text>
            )}
          </VStack>
          <VStack align="start">
            <Text>📍 Где встречаемся:</Text>
            <Text>{tour.meeting_point}</Text>
            <Text>
              📅 Когда: {formatDate(tour.date)}, {tour.time}
            </Text>
          </VStack>
        </SimpleGrid>
        <Divider my={4} />

        <Box mt={2} mb={4}>
          <Text fontSize="md">{tour.description}</Text>
          {tour.additional_description && (
            <Text fontSize="md" color="gray.600" mt={2}>
              {tour.additional_description}
            </Text>
          )}
        </Box>
      </Box>
    </Container>
  );
}
