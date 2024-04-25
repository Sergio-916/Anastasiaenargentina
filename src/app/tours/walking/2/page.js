import {
  CardBody,
  Card,
  Stack,
  Heading,
  Text,
  Container,
  ListItem,
  Flex,
  UnorderedList,
  CardFooter,
  Button,
  Divider,
  Link,
  Box
} from "@chakra-ui/react";
import PhotoCarousel from "@/app/components/PhotoCarousel";
import walkingData from "./walking2.json";

export const metadata = {
  title: "Avenida de Mayo",
  description: "Как изменился город в начале 20го века",
};

function Walking1() {
  const photos = ["/walking/2/1.jpg", "/walking/2/2.jpg", "/walking/2/3.jpg"];

  return (
    <>
      <Container maxW="container.xl">
        <Card my={5}>
          <CardBody>
            <Stack>
              <Text textAlign="center" fontSize={[16, null, 18, 24]}>
                Маршрут 2
              </Text>
              <Heading
                textAlign="center"
                size={["md", "lg", "xl"]}
                mb={[5, 10]}
              >
                Как изменился город в начале 20го века
              </Heading>

              <Flex mb={[5, 10]}>
                <PhotoCarousel photos={photos} />
              </Flex>
              <Flex direction={["column", "column", "column", "row"]} gap={10}>
                <Box>
                  <Text fontSize={["16px", "18px", "20px"]}>Что узнаем:</Text>
                  <UnorderedList>
                    {walkingData.items.map((item, index) => (
                      <ListItem key={index} fontSize={["14px", "16px", "18px"]}>
                        {item}
                      </ListItem>
                    ))}
                  </UnorderedList>
                </Box>
             
                <Box>
                  <Text fontSize={["16px", "18px", "20px"]}>Что увидим:</Text>
                  <UnorderedList>
                    {walkingData.places.map((item) => (
                      <ListItem key={item} fontSize={["14px", "16px", "18px"]}>
                        {item}
                      </ListItem>
                    ))}
                  </UnorderedList>
                </Box>
              </Flex>
            </Stack>
          </CardBody>
          <CardFooter display="flex" justify="space-between">
            <Link href="/tours/walking/">
              <Button colorScheme="teal" size={["sm", null, "md", "lg"]}>
                &lt; Назад
              </Button>
            </Link>
            <Link href="/tours/walking/3">
              <Button colorScheme="teal" size={["sm", null, "md", "lg"]}>
                Следуюшая экскурсия &gt;
              </Button>
            </Link>
          </CardFooter>
        </Card>
      </Container>
    </>
  );
}

export default Walking1;
