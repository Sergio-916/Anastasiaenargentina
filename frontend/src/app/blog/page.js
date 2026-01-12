import {
  Container,
  Text,
} from "@chakra-ui/react";
import SearchView from "../components/SearchView";

// Force dynamic rendering for this page
export const dynamic = 'force-dynamic';

export const metadata = {
  title: "Блог Анастасии Шимук",
  description: "Анастасия Шимук - гид по Аргентине, гид по Буэнос Айресу",
};

async function fetchBlogPosts() {
  const backendUrl = process.env.ENVIRONMENT == "production" ? process.env.BACKEND_URL : "http://localhost:8000";

  
  try {
    const res = await fetch(`${backendUrl}/api/v1/blog-posts/`, {
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
      <Text m={5} fontSize={["md", "lg", "xl"]} textAlign="center">
        В блоге я делюсь своим опытом жизни в Буэнос Айресе и инетерсными
        поездками, где я расскажываю много полезной информации для путешествий
      </Text>

      <SearchView postMetadata={postMetadata} />
    </Container>
  );
}
