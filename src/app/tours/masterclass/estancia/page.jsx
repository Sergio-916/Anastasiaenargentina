import {
  Text,
  Heading,
  Container,
  Link,
  Image,
  TableContainer,
  Thead,
  Tr,
  Th,
  Td,
  Table,
  Tbody,
  Flex,
  Box,
  Button,
} from "@chakra-ui/react";
import PhotoCarousel from "@/app/components/PhotoCarousel";
import estancia from "./card.master.estancia.json";

export const metadata = {
  title: "Эстанции",
  description:
    "Эксклюзивные экскурсии, фермы в пригороде Буэнос Айреса, чем заняться в Буэнос Айресе, экскурсии на целый день в Буэнос Айресе и пригороде",
};

function Estancia() {
  const photoPanorama = "/master_photos/estancia/estancia1.jpg";
  const photos = [
    "/master_photos/estancia/estancia-band.jpg",
    "/master_photos/estancia/estancia-horse.jpg",
    "/master_photos/estancia/estancia-horse2.png",
    "/master_photos/estancia/Old-man.jpg",
    "/master_photos/estancia/kids.jpg",
    "/master_photos/estancia/horces.jpg",
  ];

  return (
    <>
      <Heading my={["15px", "20px", "30px", "30"]} textAlign="center">
        {estancia.name}
      </Heading>
      <Image src={photoPanorama} mx="auto" />

      <Container maxW="container.xl">
        <Flex>
          <TableContainer mt={["20px", "20px", "30px"]} mb="20px">
            <Text ml={5} fontSize="xl" mb={4}>
              Программа (мероприятие на английском языке)
            </Text>
            <Table variant="simple" maxW="100%" whiteSpace="wrap" fontSize="lg">
              <Thead>
                <Tr>
                  <Th>Время</Th>
                  <Th>Описание</Th>
                </Tr>
              </Thead>
              <Tbody>
                {estancia.schedule.map((item, index) => (
                  <Tr key={index}>
                    <Td>{item.time}</Td>
                    <Td>{item.activity}</Td>
                  </Tr>
                ))}
              </Tbody>
            </Table>
          </TableContainer>
        </Flex>
        <Box m={10}>
          <PhotoCarousel
            photos={photos}
            limitSize={300}
            customSlidePreview={1}
          />
        </Box>
        <Link href="/tours/masterclass">
          <Button
            m={3}
            mb={10}
            colorScheme="teal"
            size={["sm", null, "md", "lg"]}
          >
            &lt; Назад
          </Button>
        </Link>
      </Container>
    </>
  );
}

export default Estancia;
