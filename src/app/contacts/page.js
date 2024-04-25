import {
  Heading,
  LinkBox,
  ListItem,
  Flex,
  Container,
  List,
  Box,
  Link,
  Image,
  SimpleGrid
} from "@chakra-ui/react";
import { GiRotaryPhone } from "react-icons/gi";
import { MdAttachEmail } from "react-icons/md";
import ContactForm from "../components/ContactForm/ContactForm";

export const metadata = {
  title: "Контакты",
  description: "Анастасия Шимук - гид по Буэной Айресу и Аргентине",
};

function Contacts() {
  const whatsappbutton = "/WhatsAppButtonGreenMedium.png";

  return (
    <>
      <Container maxW="container.xl" minH='70vh'>
        <SimpleGrid   m={8} columns={[1,1,2]} spacing={10}>
          <Box
          _hover={{boxShadow: '2xl'}}
            border="1px"
            p={5}
            borderColor="gray.300"
            borderRadius={10}
            boxShadow="lg"
                >
            <Heading mb={10}>Контакты</Heading>
            <List lineHeight={10}>
              <ListItem mb={5} fontSize={20} display="flex" alignItems="center" gap={3}>
                <GiRotaryPhone size={30} />
                <span>+541127588458 </span>
              </ListItem>
              <ListItem wordBreak="break-word" fontSize={[20,20,16,20]} display="flex" alignItems="center" gap={3}>
                <MdAttachEmail size={30} />
                <span>anastasiaenargentina@gmail.com </span>
              </ListItem>
            </List>
            <Link 
              href="https://wa.me/541127588458?text=%D0%9F%D1%80%D0%B8%D0%B2%D0%B5%D1%82!%20%D0%9C%D0%B5%D0%BD%D1%8F%20%D0%B8%D0%BD%D1%82%D0%B5%D1%80%D0%B5%D1%81%D1%83%D0%B5%D1%82%20%D1%8D%D0%BA%D1%81%D0%BA%D1%83%D1%80%D1%81%D0%B8%D1%8F"
              target="blank"
            ><Box pt={10} width={["230px",'270px','275px', '300px']} marginTop={10}>
              <Image src={whatsappbutton}  />
            </Box>
            </Link>
          </Box>
          <Box _hover={{boxShadow: '2xl'}} >
            <ContactForm />
          </Box>
        </SimpleGrid>
    
      </Container>
    </>
  );
}

export default Contacts;
