import { Text, Heading, Container, Flex, Stack } from "@chakra-ui/react";
import CardMasterclass from "../../components/Cards/MasterClass/CardMasterclass";

function MasterClases() {
  return (
    <>
      <Container minH="70vh" maxW="container.xl">
        <Heading my={15} textAlign={"center"}>
         Кроме экскурсий
        </Heading>
        <Stack gap={6} justify="center" mb={10}>
          <CardMasterclass />
        </Stack>
      </Container>
    </>
  );
}

export default MasterClases;
