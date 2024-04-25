import {
  Heading,
  Text,
  Flex,
  Container,
  UnorderedList,
  ListItem,
  Divider,
  List,
  Link,
  Button,
} from "@chakra-ui/react";
import Tangoshow from "@/app/components/Tango/Tango.options";
import autoData from "./auto1.json";


export const metadata = {
  title: "Автомобильная обзорная экскурсия",
  description: "Обзорная 4х часовая экскурсия с ужином и танго шоу",
};

function Auto1() {
  return (
    <>
      <Container maxW="container.xl">
        <Heading my={[5, null,8,8]} size={['lg', null, 'xl', 'xl']} textAlign="center">
          {autoData.title}
        </Heading>
        <Text mb={5} fontSize={['lg',null,'xl',"xl"]}>
          {autoData.description}
        </Text>
        <UnorderedList fontSize={["md", "lg", "xl"]} mb={5}>
          {autoData.highlights.map((item, index) => (
            <ListItem key={index}>{item}</ListItem>
          ))}
        </UnorderedList>
        <Divider />
        <List mt={3} fontSize={["md", "lg", "xl"]}>
          <ListItem>19:30 трансфер на танго шоу с ужином</ListItem>
          <ListItem>Танго шоу на <Link target="_blank" color={"teal.600"} fontWeight={'700'} href="/tours/masterclass/tango-show">выбор</Link></ListItem>
        </List>
 

        <Flex justify="space-between" my={[5, null,8,8]}>
          <Link href="/tours/auto/">
            <Button m={3} colorScheme="teal" size={["sm", null, "md", "lg"]}>
              &lt; Назад
            </Button>
          </Link>
          <Link href="/tours/auto/2">
            <Button m={3} colorScheme="teal" size={["sm", null, "md", "lg"]}>
              Следуюшая экскурсия &gt;
            </Button>
          </Link>
        </Flex>
      </Container>
    </>
  );
}

export default Auto1;
