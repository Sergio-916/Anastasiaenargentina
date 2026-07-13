import { Box, Stack, Text } from "@chakra-ui/react";

function formatDate(date) {
  return new Intl.DateTimeFormat("ru-RU", {
    day: "2-digit",
    month: "2-digit",
  }).format(new Date(`${date}T00:00:00`));
}

export default function EventsInstagramTitle({ startDate, endDate }) {
  const dateRange = `${formatDate(startDate)} - ${formatDate(endDate)}`;

  return (
    <Box
      w="full"
      h="full"
      position="relative"
      overflow="hidden"
      bgImage="url('/instagram_title/IMG_4669.jpg')"
      bgSize="cover"
      bgPosition="center"
    >
      <Box position="absolute" inset={0} bg="whiteAlpha.600" />

      <Stack
        position="relative"
        align="flex-end"
        spacing={5}
        pt={28}
        pr={16}
      >
        <Text
          as="h1"
          bg="white"
          color="green.900"
          borderRadius="xl"
          px={6}
          py={2}
          fontSize="6xl"
          lineHeight="shorter"
          fontWeight="900"
          letterSpacing="0"
        >
          КУДА СХОДИТЬ
        </Text>
        <Text
          bg="white"
          color="green.900"
          borderRadius="xl"
          px={6}
          py={2}
          fontSize="6xl"
          lineHeight="shorter"
          fontWeight="900"
          letterSpacing="0"
        >
          {dateRange}
        </Text>
      </Stack>
    </Box>
  );
}
