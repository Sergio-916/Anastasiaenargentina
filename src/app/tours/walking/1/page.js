import {
  CardBody,
  Card,
  Stack,
  Heading,
  Text,
  Container,
  List,
  ListItem,
  Flex,
  UnorderedList,
  CardFooter,
  Button,
  Divider,
  Link,
  Box,
} from "@chakra-ui/react";
import PhotoCarousel from "@/app/components/PhotoCarousel";
import walkingData from "./walking1.json";

export const metadata = {
  title: "Playa de Mayo",
  description: "Самая важная площадь Аргентины",
};
function Walking1() {
  const photos = [
    "/walking_photos/1/1.jpg",
    "/walking_photos/1/2.jpg",
    "/walking_photos/1/3.jpg",
  ];
  return (
    <>
      <Container maxW="container.xl">
        <Card my={5}>
          <CardBody>
            <Stack>
              <Text textAlign="center" fontSize={[16, null, 18, 24]}>
                Маршрут 1
              </Text>
              <Heading
                textAlign="center"
                size={["md", "lg", "xl"]}
                mb={[5, 10]}
              >
                Самая важная площадь Аргентины
              </Heading>
              <List fontSize={["md", "lg", "xl"]} mb={[5, 10]}>
                <ListItem>
                  Каждый этап жизни страны оставил отпечаток на самой старой
                  площади города
                </ListItem>
                <ListItem>
                  За время нашей прогулки мы узнаем как изменилась площадь за
                  4,5 столетия своей истории
                </ListItem>
              </List>
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
            <Link href="/tours/walking">
              <Button colorScheme="teal" size={["sm", null, "md", "lg"]}>
                &lt; Назад
              </Button>
            </Link>
            <Link href="/tours/walking/2">
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
