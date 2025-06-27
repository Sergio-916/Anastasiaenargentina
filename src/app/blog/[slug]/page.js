import { Box, Heading, Text, Container, Link, Button } from "@chakra-ui/react";
import Markdown from "markdown-to-jsx";
import getPostMetadata from "@/utils/getPostMetadata";
import fs from "fs";
import matter from "gray-matter";
import React from "react";

function getPostContent(slug) {
  const folder = "public/content/";
  const file = folder + `${slug}.md`;
  const content = fs.readFileSync(file, "utf8");

  const matterResult = matter(content);
  return matterResult;
}

export const generateStaticParams = async () => {
  const posts = getPostMetadata("public/content");
  return posts.map((post) => ({ slug: post.slug }));
};

export async function generateMetadata({ params, searchParams }) {
  const id = params?.slug ? " - " + params?.slug : "";
  return {
    title: `Блог Анастасии Шимук ${id.replaceAll("_", " ")}`,
  };
}

export default function RecipePage(props) {
  const slug = props.params.slug;
  const post = getPostContent(slug);
  // console.log(post);
  return (
    <main>
      <Container maxW="container.xl">
        <article>
          <Box px={[0, 6, 10, 20]} pt={5} pb={15}>
            <Markdown
              options={{
                overrides: {
                  h1: {
                    component: Heading,
                    props: { as: "h1", size: "xl", mb: 4 },
                  },
                  h2: {
                    component: Heading,
                    props: { as: "h2", size: "lg", mb: 3 },
                  },
                  h3: {
                    component: Heading,
                    props: { as: "h3", size: "md", mb: 2 },
                  },
                  h4: {
                    component: Heading,
                    props: { as: "h4", size: "sm", mb: 2 },
                  },
                  p: {
                    component: Text,
                    props: { mb: 4, lineHeight: "taller" },
                  },
                  a: {
                    component: Link,
                    props: {
                      color: "blue.700", // Цвет ссылки
                      isExternal: true, // Если ссылки должны открываться в новом окне
                    },
                  },
                },
              }}
            >
              {post.content}
            </Markdown>
            <Link href="/blog">
              <Button m={3} colorScheme="teal" size={["sm", null, "md", "lg"]}>
                &lt; Назад
              </Button>
            </Link>
          </Box>
        </article>
      </Container>
    </main>
  );
}
