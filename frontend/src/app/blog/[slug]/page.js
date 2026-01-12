import { Box, Heading, Text, Container, Link, Button } from "@chakra-ui/react";
import NextLink from "next/link";
import { notFound } from "next/navigation";

// Force dynamic rendering for this page
export const dynamic = 'force-dynamic';

// Fetch blog post by slug from API
async function fetchBlogPost(slug) {
  const backendUrl = process.env.ENVIRONMENT == "production" ? process.env.BACKEND_URL : "http://localhost:8000";

  try {
    const res = await fetch(`${backendUrl}/api/v1/blog-posts/${slug}`, {
      cache: 'no-store',
    });

    if (!res.ok) {
      if (res.status === 404) {
        return null;
      }
      const body = await res.text().catch(() => "");
      throw new Error(`Failed to fetch blog post: ${res.status} ${body.slice(0, 200)}`);
    }

    return await res.json();
  } catch (error) {
    console.error("Error fetching blog post:", error);
    return null;
  }
}

// Fetch all blog posts for static params generation
async function fetchAllBlogPosts() {
  const backendUrl = process.env.BACKEND_URL || "http://anastasia_backend:8000";

  try {
    const res = await fetch(`${backendUrl}/api/v1/blog-posts/?limit=1000`, {
      cache: 'no-store',
    });

    if (!res.ok) {
      const body = await res.text().catch(() => "");
      throw new Error(`Failed to fetch blog posts: ${res.status} ${body.slice(0, 200)}`);
    }

    const data = await res.json();
    return data.data || [];
  } catch (error) {
    console.error("Error fetching blog posts:", error);
    return [];
  }
}

export const generateStaticParams = async () => {
  const posts = await fetchAllBlogPosts();
  return posts.map((post) => ({ slug: post.slug }));
};

export async function generateMetadata({ params }) {
  const { slug } = params;
  const post = await fetchBlogPost(slug);

  if (!post) {
    return {
      title: "Пост не найден - Блог Анастасии Шимук",
      description: "Запрошенный пост не существует.",
    };
  }

  return {
    title: `${post.title} - Блог Анастасии Шимук`,
    description: post.description || post.title,
  };
}

export default async function BlogPostPage({ params }) {
  const { slug } = params;
  const post = await fetchBlogPost(slug);

  if (!post) {
    notFound();
  }

  return (
    <main>
      <Container maxW="container.xl">
        <article>
          <Box px={[0, 6, 10, 20]} pt={5} pb={15}>
            {post.title && (
              <Heading as="h2" size="lg" mb={4}>
                {post.title}
              </Heading>
            )}

            {post.reading_time_minutes && (
              <Text fontSize="sm" color="gray.500" mb={4}>
                Время прочтения: {post.reading_time_minutes} мин
              </Text>
            )}
            <Box
              mt={4}
              sx={{
                "& img": {
                  maxW: "100%",
                  height: "auto",
                  borderRadius: "md",
                  my: 4
                },
                "& p": {
                  mb: 4,
                  lineHeight: "tall"
                },
                "& ul": {
                  ml: 6,
                  mb: 4
                }
              }}
              dangerouslySetInnerHTML={{ __html: post.content }}
            />

            <Text my={5}>
              👉Эту и другие статьи вы можете найти в нашем{" "}
              <Link
                as={NextLink}
                style={{
                  color: "#004D40",
                  fontStyle: "bold",
                  textDecoration: "underline",
                }}
                target="_blank"
                href="https://t.me/laciudadcomomuseo"
              >
                Telegram канале
              </Link>{" "}

            </Text>
            <Link href="/blog">
              <Button m={3} colorScheme="teal" size={["sm", null, "md", "md"]}>
                &lt; Назад
              </Button>
            </Link>
          </Box>
        </article>
      </Container>
    </main>
  );
}
