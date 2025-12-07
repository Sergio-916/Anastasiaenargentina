import {
  Heading,
  Text,
  Flex,
  Container,
  Divider,
  Link,
  Button,
  TableContainer,
  Table,
  Thead,
  Tr,
  Th,
  Tbody,
  Td,
} from "@chakra-ui/react";
import autoData from "./auto3.json";

export const metadata = {
  title: "Однодневная автомобильная экскурсия",
  description: "Один полный день с ужином и танго шоу",
};

function Auto3() {
  return (
    <>
      <Container maxW="container.xl">
        <Heading
          my={[5, null, 8, 8]}
          size={["lg", null, "xl", "xl"]}
          textAlign="center"
        >
          {autoData.title}
        </Heading>
        <TableContainer>
          <Table
            variant="simple"
            maxW="100%"
            whiteSpace="wrap"
            fontSize={["md", "lg", "xl"]}
          >
            <Thead>
              <Tr>
                <Th>Время</Th>
                <Th>Описание</Th>
              </Tr>
            </Thead>
            <Tbody>
              {autoData.itinerary.map((item, index) => (
                <Tr key={index}>
                  <Td>{item.time}</Td>
                  <Td lineHeight={"tall"} overflowWrap="break-word">
                    {item.activity} <br /> {item.add_desc}
                    <Link
                      color="teal.600"
                      target="_blank"
                      fontWeight={"700"}
                      href="/tours/auto/1"
                    >
                      {" "}
                      {item.link}
                    </Link>{" "}
                    <Link
                      color="teal.600"
                      target="_blank"
                      fontWeight={"700"}
                      href="/tours/masterclass/tango-show"
                    >
                      {" "}
                      {item.link2}
                    </Link>{" "}
                    <br /> <i>{item.details}</i>
                    <i>{item.recommendation}</i>
                  </Td>
                </Tr>
              ))}
            </Tbody>
          </Table>
        </TableContainer>

        <Divider />

        <Flex justify="space-between" my={[5, null,8,8]}>
          <Link target="_blank" href="/tours/auto">
            <Button m={3} colorScheme="teal" size={["sm", null, "md", "lg"]}>
              &lt; Назад
            </Button>
          </Link>
          <Link href="/tours/auto/4">
            <Button m={3} colorScheme="teal" size={["sm", null, "md", "lg"]}>
              Следуюшая экскурсия &gt;
            </Button>
          </Link>
        </Flex>
      </Container>
    </>
  );
}

export default Auto3;
