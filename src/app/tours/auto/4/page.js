import {
  Heading,
  Text,
  Flex,
  Container,
   Divider,
  List,
  Link,
  Button,
  TableContainer,
  Table,
  Thead,
  Tr,
  Th,
  Tbody,
  Td,
} from "@chakra-ui/react";
import Tangoshow from "@/app/components/Tango/Tango.options";
import autoData from "./auto4.json";

function Auto4() {
  return (
    <>
      <Container maxW="container.xl">
        <Heading my={[5, null,8,8]} size={['lg', null, 'xl', 'xl']} textAlign="center">
          {autoData.description}
        </Heading>
        <TableContainer>
          <Text ml={5} fontSize={['lg',null,'xl',"xl"]} mb={4}>
            День 1
          </Text>
          <Table variant="simple" maxW="100%" whiteSpace="wrap" fontSize={["md", "lg", "xl"]}>
            <Thead >
              <Tr >
                <Th>Время</Th>
                <Th>Описание</Th>
              </Tr>
            </Thead>
            <Tbody>
              {autoData.day1.map((item, index) => (
                <Tr key={index}>
                  <Td>{item.time}</Td>
                  <Td lineHeight={"tall"}>
                    {item.activity} <br />
                    <Link color="teal.600" fontWeight={'700'} href="/tours/auto/1">  
                      {" "}
                      {item.link}
                    </Link>{" "}
                    {item.activity2}
                    <Link color="teal.600" target="_blank" fontWeight={'700'} href="/tours/masterclass/tango-show">  
                    {item.link2}
                    </Link>
                    <br />{" "}
                    <i>
                      {item.recommendation} <br /> {item.details}
                    </i>
                  </Td>
                </Tr>
              ))}
            </Tbody>
          </Table>
        </TableContainer>

       
        <Divider />

        <TableContainer mt={10}>
          <Text ml={5} fontSize={['lg',null,'xl',"xl"]} mb={4}>
            День 2
          </Text>
          <Table variant="simple" maxW="100%" whiteSpace="wrap" fontSize={["md", "lg", "xl"]}>
            <Thead>
              <Tr>
                <Th>Время</Th>
                <Th>Описание</Th>
              </Tr>
            </Thead>
            <Tbody>
              {autoData.day2.map((item, index) => (
                <Tr key={index}>
                  <Td>{item.time}</Td>
                  <Td>
                    {item.activity}<br />
                    <i>
                      {item.recommendation} <br /> {item.details}
                    </i>
                  </Td>
                </Tr>
              ))}
            </Tbody>
          </Table>
        </TableContainer>

        <Flex justify="space-between" my={[5, null,8,8]}>
          <Link href="/tours/auto">
            <Button m={3} colorScheme="teal" size={["sm", null, "md", "lg"]}>
              &lt; Назад
            </Button>
          </Link>
        </Flex>
      </Container>
    </>
  );
}

export default Auto4;
