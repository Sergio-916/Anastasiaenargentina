import { CardBody, Card, Heading, Text, Image, Flex } from "@chakra-ui/react";
function Tangoshow() {
    const tangoModern = "/auto/tango-modern.jpg";
    const tangoPortano = "/auto/tango-portano.jpg";
  return (
    <>
      <Flex direction={["column", null, null, "row"]} gap={5}>
        <Card borderRadius={10}>
          <CardBody p={[2, 3, 5]}>
            <Heading m={2} textAlign="center">
              Танго шоу MODERN
            </Heading>
            <Image src={tangoModern} borderRadius={8} />
            <Text mt={3}>Короткое описание шоу</Text>
          </CardBody>
        </Card>
        <Card borderRadius={10}>
          <CardBody p={[2, 3, 5]}>
            <Heading m={2} textAlign="center">
              Танго шоу PORTEÑO
            </Heading>
            <Image src={tangoPortano} borderRadius={8} />
            <Text mt={3}>Короткое описание шоу</Text>
          </CardBody>
        </Card>
      </Flex>
    </>
  );
}

export default Tangoshow;
