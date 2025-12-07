import {
  Heading,
  LinkBox,
  ListItem,
  Image,
  Box,
  UnorderedList,
  Container,
  Text,
  Link,
} from "@chakra-ui/react";
import blogs from "../../../public/blog.menu.json";
import Layout from "./layout";
import getPostMetadata from "@/utils/getPostMetadata";
import SearchView from "../components/SearchView";
export const metadata = {
  title: "Блог Анастасии Шимук",
  description: "Анастасия Шимук - гид по Аргентине, гид по Буэнос Айресу",
};

function Blog() {
  const postMetadata = getPostMetadata("public/content");
  // console.log(postMetadata);
  return (
    <Container maxW="container.xl" minH="70vh">
      <Text m={5} fontSize={["md", "lg", "xl"]} textAlign="center">
        В блоге я делюсь своим опытом жизни в Буэнос Айресе и инетерсными
        поездками, где я расскажываю много полезной информации для путешествий
      </Text>

      <SearchView postMetadata={postMetadata} />
    </Container>
  );
}

export default Blog;
