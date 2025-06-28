import {
  Box,
  Card,
  CardBody,
  Container,
  Heading,
  Stack,
  Text,
  Tag,
  HStack,
} from "@chakra-ui/react";
import mysql from "mysql2/promise";

// This function fetches the data from your database.
// It will run on the server at build time.
async function getTours() {
  try {
    const connection = await mysql.createConnection({
      host: process.env.DB_HOST,
      port: process.env.DB_PORT,
      user: process.env.DB_USER,
      password: process.env.DB_PASSWORD,
      database: process.env.DB_DATABASE,
    });

    const [rows] = await connection.execute("SELECT * FROM tours");
    await connection.end();
    return rows;
  } catch (error) {
    console.error("Failed to fetch tours:", error);
    return []; // Return an empty array on error
  }
}

// The page component is now async
export default async function GroupToursPage() {
  const tours = await getTours();

  return (
    <Container maxW="container.lg" py={10}>
      <Heading as="h1" size="xl" mb={8} textAlign="center">
        Group Tours
      </Heading>
      <Stack spacing={8}>
        {tours.map((tour) => (
          <Card
            key={tour.id}
            direction={{ base: "column", md: "row" }}
            overflow="hidden"
            variant="outline"
          >
            <CardBody>
              <Heading size="md">{tour.name}</Heading>
              <Text py="2">{tour.description}</Text>
              <Text color="gray.600" fontSize="sm" mt={2}>
                {tour.additional_description}
              </Text>
              <HStack spacing={4} mt={4}>
                <Tag colorScheme="teal">Duration: {tour.duration} min</Tag>
                <Tag colorScheme="blue">Cost: {tour.cost}</Tag>
                <Tag colorScheme="purple">
                  Capacity: {tour.max_capacity} people
                </Tag>
              </HStack>
            </CardBody>
          </Card>
        ))}
      </Stack>
    </Container>
  );
}
