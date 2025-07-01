import NextLink from "next/link";
import { query } from "@/utils/db";
import {
  Container,
  Heading,
  Box,
  List,
  ListItem,
  Text,
  Link,
} from "@chakra-ui/react";

export const metadata = {
  title: "Групповые экскурсии",
  description: "Групповые экскурсии по Буэнос Айресу",
};

export default async function GroupToursPage() {
  const scheduledTours = await query({
    query: `    
      SELECT
        t.name,
        t.slug,        
        td.id AS date_id,
        td.date AS raw_date,
        td.time       
      FROM
        tours AS t
      INNER JOIN
        tour_date AS td ON t.id = td.tour_id
      ORDER BY
        td.date, td.time;
    `,
  });

  const formatDate = (dateStr) => {
    const date = new Date(dateStr);
    return date.toLocaleDateString("ru-RU", {
      day: "numeric",
      month: "long",
    });
  };

  return (
    <Container maxW="container.lg" minH={["none", "none", "75vh"]}>
      <Heading size="lg" m={4}>
        Расписание экскурсий на Июль
      </Heading>
      <List>
        {scheduledTours.map((tour) => (
          <ListItem key={tour.date_id}>
            <Link href={`/group-tours/${tour.slug}/${tour.date_id}`}>
              📅{formatDate(tour.raw_date)}, {tour.time} - {tour.name}
            </Link>
          </ListItem>
        ))}
      </List>
      <Text mt={4}>
        👉Запись в{" "}
        <Link
          as={NextLink}
          style={{
            color: "#004D40",
            fontStyle: "bold",
            textDecoration: "underline",
          }}
          target="_blank"
          href="https://ig.me/m/anastasiaenargentina/"
        >
          Директ инстаграм
        </Link>{" "}
        или{" "}
        <Link
          as={NextLink}
          style={{
            color: "#004D40",
            fontStyle: "bold",
            textDecoration: "underline",
          }}
          target="_blank"
          href="https://wa.me/541127588458?text=%D0%9F%D1%80%D0%B8%D0%B2%D0%B5%D1%82!%20%D0%9C%D0%B5%D0%BD%D1%8F%20%D0%B8%D0%BD%D1%82%D0%B5%D1%80%D0%B5%D1%81%D1%83%D0%B5%D1%82%20%D1%8D%D0%BA%D1%81%D0%BA%D1%83%D1%80%D1%81%D0%B8%D1%8F"
        >
          WhatsApp
        </Link>
      </Text>
      <Text my={4}>
        Если вашей даты нет, вы можете заказать индивидуальную экскурсию на
        удобное вам время.
      </Text>
    </Container>
  );
}
