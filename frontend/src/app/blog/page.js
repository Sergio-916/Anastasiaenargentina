import {
  Container,
  Heading,
  Text,
} from "@chakra-ui/react";
import { getBackendUrl } from "@/utils/settings";
import SearchView from "../components/SearchView";

// Force dynamic rendering for this page
export const dynamic = 'force-dynamic';

export const metadata = {
  title: "Блог Анастасии Шимук",
  description: "Анастасия Шимук - гид по Аргентине, гид по Буэнос Айресу",
  alternates: {
    canonical: "/blog",
  },
};

async function fetchBlogPosts() {
  try {
    const res = await fetch(`${getBackendUrl()}/api/v1/blog-posts/`, {
      cache: 'no-store',
    });

    if (!res.ok) {
      const body = await res.text().catch(() => "");
      throw new Error(`Failed to fetch blog posts: ${res.status} ${body.slice(0, 200)}`);
    }

    const data = await res.json();
    return data;
  } catch (error) {
    console.error("Error fetching blog posts:", error);
    // Return empty data structure on error
    return { data: [], count: 0 };
  }
}

export default async function Blog() {
  const blogPostsData = await fetchBlogPosts();
  
  // Transform API data to match expected format
  const postMetadata = blogPostsData.data.map((post) => ({
    title: post.title,
    slug: post.slug,
    time: post.reading_time_minutes ? `${post.reading_time_minutes} мин` : "N/A",
    description: post.description,
    date: post.created_at ? new Date(post.created_at) : new Date(),
  }));

  return (
    <Container maxW="container.xl" minH="70vh">
      <Heading as="h1" m={5} textAlign="center" size={["lg", null, "xl", "xl"]}>
        Блог Анастасии Шимук
      </Heading>
      <Text m={5} fontSize={["md", "lg", "xl"]} textAlign="center">
        В блоге я делюсь своим опытом гида в Буэнос Айресе, где я рассказываю много полезной информации о стране и ее культуре.
      </Text>

      <SearchView postMetadata={postMetadata} />
    </Container>
  );
}
