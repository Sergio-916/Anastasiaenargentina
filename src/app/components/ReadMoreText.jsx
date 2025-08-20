'use client'
import {
    Box,
    Button,
    Text,
  } from "@chakra-ui/react";
import { useState } from "react";

export function ReadMoreText({ content, limit = 200 }) {
    const [isShown, setIsShown] = useState(false);

    const text = content;
    const isLongText = text.length > limit;

    const toShow =
      isShown || !isLongText ? text : text.substring(0, limit) + "...";

    return (
      <Box>
        <Text p="5px"  pb="20px" >
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