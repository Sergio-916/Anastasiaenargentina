'use client';

import { useEffect } from 'react';
import { Center, Spinner, Text, VStack } from '@chakra-ui/react';

export default function AdminPage() {
  useEffect(() => {
    // Get backend URL from environment or default
    const backendUrl =
  process.env.NEXT_PUBLIC_ENVIRONMENT === "production"
    ? process.env.NEXT_PUBLIC_BACKEND_URL
    : "http://localhost:8000";
   
    // // Redirect to backend admin panel (let backend handle auth state)
    window.location.href = `${backendUrl}/admin`;
  }, []);

  return (
    <Center h="100vh">
      <VStack spacing={4}>
        <Spinner size="xl" color="blue.500" thickness="4px" />
        <Text fontSize="lg" color="gray.600">Redirecting to Admin Panel...</Text>
      </VStack>
    </Center>
  );
}
