import {
  Box,
  Flex,
  Heading,
  Text,
  VStack,
  Spacer,
  SimpleGrid,
  Container,
  Divider,
} from "@chakra-ui/react";
import { query } from "@/utils/db";

export const metadata = {
  title: "Групповые экскурсии",
  description: "Групповые экскурсии по Буэнос Айресу",
};

export async function generateStaticParams() {
  const tours = await query({ query: "SELECT slug FROM tours" });
  return tours.map((tour) => ({
    slug: tour.slug,
  }));
}

export default async function TourPage({ params, searchParams }) {
  const { slug } = params;
  const date_id = searchParams?.date_id;
  const [tour] = await query({
    query: `SELECT * FROM tours 
    INNER JOIN
     tour_date ON tours.id = tour_date.tour_id
    WHERE tours.slug = ? AND tour_date.id = ?`,
    values: [slug, date_id],
  });

  if (!tour) {
    return <div>Tour not found</div>;
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
    <Container maxW="container.lg" mt={4}>
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
