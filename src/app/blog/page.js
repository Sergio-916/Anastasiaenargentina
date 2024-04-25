import {
  Heading,
  LinkBox,
  ListItem,
  Image,
  Box,
  UnorderedList,
  Container,
  Text,
  Link
} from "@chakra-ui/react";
import blogs from "./blog.menu.json";

import Logo2 from '../../../public/trip/bariloche.jpg';

// export const metadata = {
//   title: "Блог",
//   description: "Анастасия Шимук - гид по Аргентине, гид по Буэнос Айресу",
// };

function Blog() {
  return (
    <>
      <Container maxW='container.xl'>
        <Heading m={10} textAlign="center">
          Блог Анастасии Шимук
        </Heading>

        <Image src={Logo2} alt="Bariloche" /> 

        <Text mb={20} fontSize="xl" textAlign="center">
          В блоге я делюсь своим опытом жизни в Буэнос Айресе и
          инетерсными поездками, где я расскажываю много полезной информации для
          путешествий
        </Text>
        <UnorderedList fontSize="xl">
          {blogs.blogs.map((blog, index) => (
            <Link key={index} href={`blog${blog.link}`}>
              <ListItem key={index}>{blog.title}</ListItem>
            </Link>
          ))}
        </UnorderedList>



      </Container>
    </>
  );
}

export default Blog;
