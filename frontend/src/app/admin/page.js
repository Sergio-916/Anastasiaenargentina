'use client';

import { useEffect } from 'react';
import { Center, Spinner, Text, VStack } from '@chakra-ui/react';
import { getBackendUrl } from '@/utils/settings';

export default function AdminPage() {
  useEffect(() => {
    window.location.href = `${getBackendUrl()}/admin`;
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
