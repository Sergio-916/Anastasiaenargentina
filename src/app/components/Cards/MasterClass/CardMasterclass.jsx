import {
  Image,
  Box,
  Text,
  Flex,
  Heading,
  Card,
  CardFooter,
  CardBody,
  LinkBox,
  LinkOverlay,
} from "@chakra-ui/react";
import mastermenu from "./card.master.menu.json";

function CardMasterclass() {
  return (
    <>
      {mastermenu.masterclass.map((item, index) => (
        <Card
          key={index}
          boxShadow="lg"
          borderRadius={10}
          _hover={{ boxShadow: "2xl" }}
        >
          <LinkBox>
            <CardBody display="flex" gap={7}>
              <Image
                borderRadius={5}
                src={item.photo}
                height={['150px','200px',"200px"]}
                width="auto"
              />
              <Box>
                <LinkOverlay
                  href={`/tours/masterclass/${item.nav}`}
                ></LinkOverlay>
                <Heading mb={10} size={["md", "lg"]}>
                  {item.name}
                </Heading>
                <Text fontSize={["md", "lg", "xl"]}>{item.description}</Text>
              </Box>
            </CardBody>
            <CardFooter>
              <Box fontSize={["lg", "xl"]} color="teal.500" fontWeight="bold">
                Подробнее...
              </Box>
            </CardFooter>
          </LinkBox>
        </Card>
      ))}
    </>
  );
}

export default CardMasterclass;
