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
  import walkingData from "./walking5.json";
  
  export const metadata = {
    title: "San Telmo",
    description: "Начало города",
  };
  
  function Walking5() {
    const photos = [
      "/walking_photos/5/1.jpg",
      "/walking_photos/5/2.jpg",
      "/walking_photos/5/3.jpg",
     
    ];
  
    return (
      <>
        <Container maxW="container.xl">
          <Card my={5}>
            <CardBody>
              <Stack>
                <Text textAlign="center" fontSize={[16, null, 18, 24]}>
                  Маршрут 5
                </Text>
                <Heading
                  textAlign="center"
                  size={["md", "lg", "xl"]}
                  mb={[5, 10]}
                >
                  {" "}
                  {walkingData.Route5.title}
                </Heading>
                <Flex mb={[5, 10]}>
                  <PhotoCarousel photos={photos} />
                </Flex>
                <Flex direction={["column", "column", "column", "row"]} gap={10}>
                <Box>
                  <Text fontSize={["16px", "18px", "20px"]}>Что узнаем:</Text>
                  <UnorderedList>
                    {walkingData.Route5.items.map((item, index) => (
                      <ListItem key={index} fontSize={["14px", "16px", "18px"]}>
                        {item}
                      </ListItem>
                    ))}
                  </UnorderedList>
                </Box>
             
                <Box>
                  <Text fontSize={["16px", "18px", "20px"]}>Что увидим:</Text>
                  <UnorderedList>
                    {walkingData.Route5.places.map((item) => (
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
              <Link href="/tours/walking/6">
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
  
  export default Walking5;
  