import { Text, Heading, Container } from "@chakra-ui/react";
import TripCard from "@/app/components/Cards/TripCard/Card.trip";

function ArgentinaTrip() {
  return (
    <>
      <Container maxW="container.xl">
        <Heading mt={15} size={["lg", "lg", "xl"]} textAlign={"center"}>
          Путешествия по Аргентине с индивидуальной программой
        </Heading>

        <Text fontSize={['md',"lg", "xl"]} p={5}>
          Я составлю идеальный и детально проработанный план вашего путешествия
          по самым интересным уголкам Аргентины. В каждом месте куда мы
          отправимся я отобрала лучшие рестораны, отели и самые интересные
          экскурсионные программы от местных гидов.
        </Text>

        <TripCard />
      </Container>
    </>
  );
}

export default ArgentinaTrip;
