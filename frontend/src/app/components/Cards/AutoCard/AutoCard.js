import autoData from "./autotours.json";
import {
  Heading,
  LinkBox,
  ListItem,
  Flex,
  UnorderedList,
  Box,
  LinkOverlay,
} from "@chakra-ui/react";

function AutoCard() {
  return (
    <>
      <Flex gap={[5, null, 10]} wrap="wrap">
        {autoData.tours.map((item, index) => (
          <LinkBox
            key={index}
            as="article"
            fontSize={["lg", "xl"]}
            w={["100%", null, "100%","45%"]}
            p="5"
            borderWidth="1px"
            rounded="md"
          >
            <Heading size={["md", "lg"]} my="2" fontSize={["lg", "xl"]}>
              {item.title}
              <LinkOverlay href={`/tours/auto/${index + 1}`}></LinkOverlay>
            </Heading>
            <UnorderedList mb="2" fontSize={["md", "lg", "xl"]}>
              <ListItem>Длительность: {item.duration}</ListItem>
              <ListItem>Включает: {item.includes}</ListItem>
            </UnorderedList>
            <Box fontSize={["lg", "xl"]} color="teal.500" fontWeight="bold">
              Подробнее...
            </Box>
          </LinkBox>
        ))}
      </Flex>
    </>
  );
}

export default AutoCard;
