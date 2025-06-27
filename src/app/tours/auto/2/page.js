import {
  Heading,
  Text,
  Container,
  Image,
  ListItem,
  Flex,
  UnorderedList,
  Button,
  Divider,
  Link,
} from "@chakra-ui/react";
import autoData from "./auto2.json";
import PhotoCarousel from "@/app/components/PhotoCarousel";

export const metadata = {
  title: "Автомобильная экскурсия по северу провинции Буэнос Айреса",
  description: "Поездка по обеспеченной северной провинции: Olivos, San Isidro, Tigre",
};

function Auto2() {
  const photos = [
    "/auto_photos/north1.jpg",
    "/auto_photos/north2.jpg",
    "/auto_photos/north3.jpg",
    "/auto_photos/north4.jpg",
    "/auto_photos/lunch.jpg",
    "/auto_photos/north5.jpg",
  ];
  return (
    <>
      <Container maxW="container.xl">
        <Heading  my={[5, null,8,8]} size={['lg', null, 'xl', 'xl']} textAlign="center">
          {autoData.title}
        </Heading>
        <Text mb={5} fontSize={['lg',null,'xl',"xl"]}>
          {autoData.description}
        </Text>
        <PhotoCarousel photos={photos}/>
        <UnorderedList mt={5} fontSize={["md", "lg", "xl"]} mb={5}>
            {autoData.items.map((item, index) => (
          <ListItem key={index}>{item}</ListItem>
            ))}
        </UnorderedList>
        <Divider />

        <Flex justify="space-between" my={[5, null,8,8]} >
          <Link href="/tours/auto">
            <Button m={3} colorScheme="teal" size={["sm", null, "md", "lg"]}>
              &lt; Назад
            </Button>
          </Link>
          <Link href="/tours/auto/3">
            <Button m={3} colorScheme="teal" size={["sm", null, "md", "lg"]}>
              Следуюшая экскурсия &gt;
            </Button>
          </Link>
        </Flex>
      </Container>
    </>
  );
}

export default Auto2;
