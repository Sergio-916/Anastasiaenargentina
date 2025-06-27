'use client';

import { useState } from 'react';
import { Button, Container, Heading, Input, FormControl, FormLabel, Box, Text, Textarea } from '@chakra-ui/react';

// WARNING: This is not a secure way to protect a page.
// The password is visible in the public source code.
const ADMIN_PASSWORD = "your_simple_password"; // <-- CHANGE THIS

export default function AdminPage() {
  const [password, setPassword] = useState('');
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');

  const handleLogin = (e) => {
    e.preventDefault();
    if (password === ADMIN_PASSWORD) {
      setIsAuthenticated(true);
    } else {
      alert('Incorrect password');
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    // In a real application, you would send this data to a server.
    // For a static site, you might copy this data manually.
    console.log("Title:", title);
    console.log("Content:", content);
    alert('Data logged to console. You can copy it from there.');
  };

  if (!isAuthenticated) {
    return (
      <Container>
        <Box maxW="md" mx="auto" mt={10} p={5} borderWidth={1} borderRadius="lg">
          <Heading mb={5}>Admin Login</Heading>
          <form onSubmit={handleLogin}>
            <FormControl mb={3}>
              <FormLabel>Password</FormLabel>
              <Input type="password" value={password} onChange={(e) => setPassword(e.target.value)} />
            </FormControl>
            <Button type="submit">Login</Button>
          </form>
        </Box>
      </Container>
    );
  }

  return (
    <Container>
      <Box maxW="lg" mx="auto" mt={10} p={5} borderWidth={1} borderRadius="lg">
        <Heading mb={5}>Admin Panel</Heading>
        <form onSubmit={handleSubmit}>
          <FormControl mb={3}>
            <FormLabel>Title</FormLabel>
            <Input type="text" value={title} onChange={(e) => setTitle(e.target.value)} />
          </FormControl>
          <FormControl mb={3}>
            <FormLabel>Content</FormLabel>
            <Textarea value={content} onChange={(e) => setContent(e.target.value)} />
          </FormControl>
          <Button type="submit">Submit</Button>
        </form>
      </Box>
    </Container>
  );
}
