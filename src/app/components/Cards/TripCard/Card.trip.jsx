import {
  Container,
  Heading,
  Card,
  CardHeader,
  CardBody,
  CardFooter,
  Image,
  Text,
  Box,
} from "@chakra-ui/react";
import tripInfo from "./trip.info.json";
import { ReadMoreText } from "../../ReadMoreText";
function TripCard() {
  return (
    <>
      {tripInfo.tours.map((item, index) => (
        <Card
          key={index}
          direction={{ base: "column", sm: "column", md: "row" }}
          overflow="hidden"
          variant="outline"
        >
          <Image m={5} borderRadius={10}  src={item.photo} maxW={250} maxH={332} />
          <Box>
            <CardHeader>
              <Heading size={["md", "lg"]}>{item.name}</Heading>
            </CardHeader>
            <CardBody fontSize={["md", "lg", "xl"]}>
              <ReadMoreText content={item.description} limit={200} />
            </CardBody>
          </Box>
        </Card>
      ))}
    </>
  );
}

export default TripCard;
