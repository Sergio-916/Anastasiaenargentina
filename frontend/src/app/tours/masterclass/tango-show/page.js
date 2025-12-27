import {
  Text,
  Heading,
  Container,
  Flex,
  Box,
  Image,
  Button,
  Accordion,
  AccordionItem,
  AccordionButton,
  AccordionPanel,
  Card,
  CardBody,
  CardFooter,
  CardHeader,
  AccordionIcon,
  UnorderedList,
  ListItem,
  Link,
} from "@chakra-ui/react";


export const metadata = {
    title: "Танго шоу",
    description: "Эксклюзивные экскурсии, лучшие танго шоу в Буэнос Айресе, забронировать танго шоу, пойти на танго шоу, лучшее танго шоу в Буэнос Айресе",
  };
  

import tangodata from "./tango.show.json";

function TangoShow() {
  return (
    <>
      <Container maxW="container.2xl">
        <Heading my={"25px"} fontSize={["2xl", "3xl", "4xl"]} textAlign="center">
          Танго-шоу на выбор
        </Heading>
       
        {tangodata.tango_shows.map((item, index) => (
          <Card key={index}>
            <CardHeader>
              <Heading size={["md", "lg", "xl"]} mb="lg" textAlign={"center"}>
                {item.name}
              </Heading>
            </CardHeader>
            <CardBody>
              <Flex direction={["column", "column", "row"]}>
                {item.photos.map((photo, index) => (
                  <Image
                    key={index}
                    width={["100%", "100%", "45%"]}
                    m={"10px"}
                    borderRadius={10}
                    src={photo}
                  />
                ))}
              </Flex>

              <UnorderedList mt={10}>
                {item.description.map((item, index) => (
                  <ListItem fontSize={["md", "lg", "xl"]} key={index}>{item}</ListItem>
                ))}
              </UnorderedList>
            </CardBody>
            {item.reviews && item.reviews.length > 0 && (
              <Accordion allowToggle m={10}>
                <AccordionItem>
                  <h2>
                    <AccordionButton width="100%" border={"none"}>
                      <Box fontSize={["md", "lg", "xl"]} as="span" flex="1" textAlign="left">
                        Отзывы
                      </Box>
                      <AccordionIcon />
                    </AccordionButton>
                  </h2>
                  {item.reviews.map((review, index) => (
                    <AccordionPanel fontSize={["md", "lg", "xl"]} key={index}>{review}</AccordionPanel>
                  ))}
                </AccordionItem>
              </Accordion>
            )}
          </Card>
        ))}
         <Text fontStyle={"italic"} mt={10} fontSize={["md", "lg", "xl"]}>
          Все танго-шоу предоставляют трансферы от гостиниц в центре города
        </Text>
        <Link
          m={10}
          textDecoration={"none"}
          display={"flex"}
          justifyContent={"end"}
          target="blank"
          href="https://wa.me/541127588458?text=%D0%9F%D1%80%D0%B8%D0%B2%D0%B5%D1%82!%20%20%D0%A5%D0%BE%D1%87%D1%83%20%D0%B7%D0%B0%D0%B1%D1%80%D0%BE%D0%BD%D0%B8%D1%80%D0%BE%D0%B2%D0%B0%D1%82%D1%8C%20%D0%A2%D0%B0%D0%BD%D0%B3%D0%BE-%D1%88%D0%BE%D1%83%20"
        >
          <Button m={3} colorScheme="teal" size={["sm", null, "md", "lg"]}>
            Забронировать Танго-шоу
          </Button>
        </Link>
      </Container>
    </>
  );
}

export default TangoShow;
