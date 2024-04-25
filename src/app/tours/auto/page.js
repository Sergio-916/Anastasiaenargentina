import {

  Heading,
   Container,
 
  ListItem,
  Flex,
  UnorderedList,
    Image
} from "@chakra-ui/react";
import autoData from "./auto.json";
import AutoCard from "@/app/components/Cards/AutoCard/AutoCard";

export const metadata = {
  title: "Автомобильные экскурсии",
  description: "Эксклюзивные экскурсии по Буэнос Айресу на автомобиле, лодке, танго шоу",
};

function Auto() {
  const photo = "/auto/auto.jpg";

  return (
    <>
      <Container maxW="container.xl">
        <Heading mt={5} mb={[0,3,5,10]} size={['lg',"xl", 'xl']} textAlign="center">
          Автомобильные экскурсии
        </Heading>
        <Flex direction={["column", "column", "column", "row"]}>
          <UnorderedList my={5} fontSize={['lg',null,'xl', '2xl']} lineHeight={['tall', null, 'taller']}>
            {autoData.auto.map((item) => (
              <ListItem key={item}>{item}</ListItem>
            ))}
          </UnorderedList>
          <Image shadow={'xl'} aspectRatio='initial' maxWidth={['100%','100%','100%','45%']} height='auto' src={photo} borderRadius={10}/>
        </Flex>
        <Heading my={10} size={["md", "lg", "lg"]} textAlign="center">
          Варианты автомобильных экскурсий
        </Heading>
        <AutoCard/>


      </Container>
    </>
  );
}

export default Auto;
