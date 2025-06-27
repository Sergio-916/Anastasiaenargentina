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

export const metadata = {
  title: "Блог",
  description: "Анастасия Шимук - гид по Аргентине, гид по Буэнос Айресу",
};

function Layout({ children }) {
  return (
    <>
      <Container maxW="container.xl">
        <Link style={{ textDecoration: "none" }} href="/blog">
          <Heading m={5} textAlign="center" size={["lg", null, "xl", "xl"]}>
            Блог Анастасии Шимук
          </Heading>
        </Link>

        {children}
      </Container>
    </>
  );
}

export default Layout;
