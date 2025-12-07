import Link from "next/link";
import {
  Box,
  Flex,
  Text,
  Stack,
  UnorderedList,
  ListItem,
} from "@chakra-ui/react";

export default function PostCard(props) {
  const { post } = props;
  return (

      <Box>
        <UnorderedList py={1} >
          <ListItem>
            <Link href={`/blog/${post.slug}`}>
              <Text fontSize={["sm", "lg", "lg"]}>{post.title}</Text>
              <Text fontSize={["xs", "sm", "sm"]} fontStyle={"italic"}>
                Время прочтения: {post.time}
              </Text>
            </Link>
          </ListItem>
        </UnorderedList>
      </Box>

  );
}
