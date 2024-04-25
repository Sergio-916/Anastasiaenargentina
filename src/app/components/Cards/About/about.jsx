import About from "@/app/about/page";
import {
  Heading,
  LinkBox,
  Image,
  Flex,
  Text,
  Box,
  Center,
} from "@chakra-ui/react";

function AboutCard({ item, img, index }) {
  return (
    <>
      <Box
        key={index}
        boxShadow={"lg"}
        bgColor={"teal.400"}
        p={"20px"}
        mb={"20px"}
        position="relative"
        borderRadius={"10px"}
      >
        <Image
          src={img}
          aspectRatio={"4/3"}
          height={["250px", "400px", "500px", "600px"]}
          mb={"80px"}
        />

        <Box
          position={"absolute"}
          right={"10px"}
          bottom={"10px"}
          width={["350px", "350px", "400px", "450px"]}
        >
          <Text
            textAlign={"center"}
            verticalAlign={"center"}
            fontWeight={"bold"}
            borderRadius={"30px"}
            h={["150px", "150px", "220px", "220px"]}
            bgColor={"gray.50"}
            pt={["15px", "20px", "30px", "35px"]}
            fontSize={["xs","sm","md", "lg", "lg",]}
          >
            {item}
          </Text>
        </Box>
      </Box>
    </>
  );
}

export default AboutCard;
