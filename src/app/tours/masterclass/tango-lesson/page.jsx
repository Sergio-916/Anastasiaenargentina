import {
  Text,
  Heading,
  Container,
  Flex,
  Stack,
  List,
  ListItem,
  Link,
  Divider,
  Image,
  Button,
} from "@chakra-ui/react";
import { TbHandFinger } from "react-icons/tb";

export const metadata = {
  title: "Уроки Танго",
  description:
    "Уроки Танго в Буэнос Айресе, хочу танцевать, милонга, танго шоу",
};

function Tango() {
  const photo = "/master/tango/tango3.jpg";
  return (
    <>
      {" "}
      <Container maxW="container.2xl">
        <Heading my={"25px"} size={["lg", "lg", "xl"]} textAlign="center">
          Танго-класс в историческом зале в центре города
        </Heading>
        <List fontSize={["md", "lg", "xl"]} lineHeight={"tall"}>
          <ListItem>
            Вам и вашему партнеру я очень рекомендую взять{" "}
            <b>частный урок танго</b> и <b>сходить на милонгу</b>.
          </ListItem>
          <ListItem>
            Это отдельное городское удовольствие, скрытое от толп туристов.
          </ListItem>
          <ListItem>
            На своей первой милонге вы поймете, что такое танго для аргентинца,
            увидите, как тангерос общаются на языке танго, и точно выйдите на
            танец в сопровождение Михаила.
          </ListItem>
          <ListItem display="flex" alignItems="center" gap={3}>
            <TbHandFinger size={30} /> Вам нужна удобная обувь, можно на плоской
            нескользящей подошве.
          </ListItem>
        </List>

        <Flex direction={["column", "column", "row"]} gap={10} m={10}>
          <Image
            src={photo}
            maxW="400px"
            maxH={"400px"}
            boxShadow={"lg"}
            borderRadius={5}
          />

          <Text fontSize={["md", "lg", "xl"]}>
            Мастер-класс проводят Михаил и Эльвира Чудины, чемпионы России по
            аргентинскому танго по версии Международной федерации аргентинского
            танго, многократные финалисты чемпионата "Милонга России" и чемпионы
            в категории "танго-вальс". Их называют своими учителями сотни
            тангерос со всего мира, от Сан-Франциско и Тайваня до Минска и
            Томска. В настоящее время они живут в Буэнос-Айресе, преподают и
            выступают здесь, делясь своим искусством и своей страстью.
          </Text>
        </Flex>

        <Text fontSize={["md", "lg", "xl"]}>
          Танго-класс проводится в историческом зале в центре Буэнос Айреса на
          улице Santa Fe
        </Text>

        {/* <Text ml={5} fontSize="xl" mb={"10px"} mt={"25px"}>
          Стоимость
        </Text>
        <TableContainer minH="35vh">
          <Table variant="simple" fontSize={["md", "lg", "xl"]}>
            <Tbody>
              <Tr>
                <Td w="30%">Урок для 1-2 участников</Td>
                <Td>50 USD / час + аренда зала (~ 15 USD)</Td>
              </Tr>
              <Tr>
                <Td>Урок для группы 3-5 участников </Td>
                <Td>70 USD / час + аренда зала</Td>
              </Tr>
              <Tr>
                <Td>Сопровождение на милонгу </Td>
                <Td>100 USD + входные билеты</Td>
              </Tr>
            </Tbody>
          </Table>
        </TableContainer> */}
        <Divider />
        
        <Link href="/tours/masterclass/">
          <Button
            m={3}
            my={7}
           
            colorScheme="teal"
            size={["sm", null, "md", "lg"]}
          >
            &lt; Назад
          </Button>
        </Link>
      </Container>
    </>
  );
}

export default Tango;
