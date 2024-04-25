import {
  Text,
  Card,
  CardHeader,
  Heading,
  CardBody,
  CardFooter,
  Button,
  Link,
  Flex,
  Image
} from "@chakra-ui/react";
import NextLink from "next/link";
import cardMenuInfo from "./card.menu.json";
import { FaShoePrints, FaCarSide, FaPlane } from "react-icons/fa6";
import { RiShip2Fill } from "react-icons/ri";
import { GiPaintBrush } from "react-icons/gi";

function CardMenu() {
 
  const icons = [
    [<FaShoePrints size={50} />, <FaShoePrints size={50} />],
    [<FaCarSide size={50} />, <RiShip2Fill size={50} />],
    [<GiPaintBrush size={50} />, <Image boxSize={'55px'} src="/master/tango-show/performance.png"/>], 
    [<FaPlane size={50} />, <Image boxSize={'55px'}  src="/trip/mountain.png"/>],
  ];



  return (
    <>
      {cardMenuInfo.tours.map((item, index) => (
        <Card align="center" key={index}  _hover={{boxShadow:'2xl'}} mb={10}>
          <CardHeader>
            <Heading fontSize={['lg','xl', '2xl']}>{item.type}</Heading>
          </CardHeader>
          <CardBody>
            <Flex
              direction="row"
              justify="center"
              gap="30px"
              align="center"
              mb="50px"
              px="30px"
            >
              {icons[index]}
            </Flex>
            <Text fontSize={['md','lg', 'xl']}>
              {item.description}
            </Text>
          </CardBody>
          <CardFooter>
            <Link as={NextLink} href={`/tours/${item.nav}`}>
              <Button size={['sm', 'md', 'lg']} colorScheme="teal">Подробнее</Button>
            </Link>
          </CardFooter>
        </Card>
      ))}
    </>
  );
}

export default CardMenu;
