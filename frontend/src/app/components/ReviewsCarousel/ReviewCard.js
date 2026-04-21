"use client";
import React, { useState } from "react";
import { Image, Box, Text, Button } from "@chakra-ui/react";

function ReviewCard({ img, content, title }) {

  function ReadMoreText({ content, limit = 200 }) {
    const [isShown, setIsShown] = useState(false);

    const text = content;
    const isLongText = text.length > limit;

    const toShow =
      isShown || !isLongText ? text : text.substring(0, limit) + "...";

    return (
      <Box   minHeight="277px">
        <Text p="5px" textAlign="center" pb="20px" mt="-20px">
          {toShow}
        </Text>
        {isLongText && (
          <Button size="sm" onClick={() => setIsShown(!isShown)}>
            {isShown ? "Скрыть" : "Читать далее"}
          </Button>
        )}
      </Box>
    );
  }

  return (
    <>
      <Box height="auto" width='280px'>
        <Box
          position="relative"
          left="120px"
          top="90px"
          width="160px"
          height="160px"
          borderRadius="50%"
          bgColor="var(--chakra-colors-chakra-border-color)"
          display="flex"
          alignItems="center"
          justifyContent="center"
          overflow="hidden"
          border="5px solid var(--chakra-colors-chakra-border-color)"
          borderColor="gray.300"
        >
          <Image
            src={img}
            alt={title}
            boxSize="160px"
            borderRadius="50%"
            objectFit="contain"
          />
        </Box>
        <Box
          _hover={{
            boxShadow: "2xl",
          }}
          boxShadow="xl"
          borderRadius="xl"
          w="250px"
          bgColor="gray.100"
          mb="110px"
          pt="120px"
          ml='15px'
        >
          <ReadMoreText
            limit={200}
            content={content}
            userSelect="none"
            position="relative"
            fontSize="xs"
          >
            {content}
          </ReadMoreText>
        </Box>
      </Box>
    </>
  );
}

export default ReviewCard;
