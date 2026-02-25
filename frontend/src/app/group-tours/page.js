import NextLink from "next/link";
import {
  Container,
  Heading,
  List,
  ListItem,
  Text,
  Link,
} from "@chakra-ui/react";
import { SHOW_GROUP_TOURS, getBackendUrl } from "@/utils/settings";
import NoGroupTours from "@/app/components/NoGroupTours";

export const metadata = {
  title: "Групповые экскурсии",
  description: "Групповые экскурсии по Буэнос Айресу",
};

export default async function GroupToursPage() {
  const res = await fetch(`${getBackendUrl()}/api/v1/tours/`, { cache: "no-store" });
  if (!res.ok) {
    const body = await res.text().catch(() => "");
    throw new Error(`Failed to fetch tours: ${res.status}. ${body.slice(0, 200)}`);
  }

  const scheduledTours = await res.json();

  const formatDate = (dateStr) => {
    const date = new Date(dateStr);
    return date.toLocaleDateString("ru-RU", {
      day: "numeric",
      month: "long",
    });
  };
  
  const monthNames = {
  1: "Январь",
  2: "Февраль",
  3: "Март",
  4: "Апрель",
  5: "Май",
  6: "Июнь",
  7: "Июль",
  8: "Август",
  9: "Сентябрь", 
  10: "Октябрь",
  11: "Ноябрь",
  12: "Декабрь",
};
  const currentMonth = new Date().getMonth() + 1;
  const currentMonthName = monthNames[currentMonth];
  const nextMonth = currentMonth === 12 ? 1 : currentMonth + 1;
  const nextMonthName = monthNames[nextMonth];

const filteredTours = scheduledTours.filter((tour) => {
    const tourMonth = new Date(tour.raw_date).getMonth() + 1;

    return tourMonth === currentMonth || tourMonth === nextMonth;
  });


  if (filteredTours.length === 0) {
    return <NoGroupTours />;
  } 

  return (
    <Container maxW="container.lg" minH={["none", "none", "75vh"]}>
      <Heading size="lg" m={4}>
        Расписание экскурсий на {currentMonthName} 
        { nextMonthName ? ` и ${nextMonthName}` : ""}
      </Heading>
      <List>
        {filteredTours.map((tour) => (
          <ListItem key={tour.date_id}>
            <Link href={`/group-tours/${tour.slug}/${tour.date_id}`}>
              📅 {formatDate(tour.raw_date)}, {tour.time} - {tour.name}
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
