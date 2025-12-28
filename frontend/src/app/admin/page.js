'use client';

import { useState, useEffect } from 'react';
import { 
  Button, 
  Container, 
  Heading, 
  Input, 
  FormControl, 
  FormLabel, 
  Box, 
  Alert,
  AlertIcon,
  VStack,
  Text,
  Link
} from '@chakra-ui/react';

// Get backend URL from environment variables
const getBackendUrl = () => {
  if (typeof window !== 'undefined') {
    return process.env.NEXT_PUBLIC_BACKEND_URL || 'http://127.0.0.1:8000';
  }
  return 'http://127.0.0.1:8000';
};

export default function AdminPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [token, setToken] = useState('');

  // Check if already authenticated on mount
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const savedToken = localStorage.getItem('admin_token');
      if (savedToken) {
        // Verify token is still valid
        verifyToken(savedToken);
      }
    }
  }, []);

  const verifyToken = async (tokenToVerify) => {
    try {
      const response = await fetch('/api/admin/verify-token', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ token: tokenToVerify }),
      });

      if (response.ok) {
        setToken(tokenToVerify);
        setIsAuthenticated(true);
      } else {
        localStorage.removeItem('admin_token');
      }
    } catch (err) {
      console.error('Token verification error:', err);
      localStorage.removeItem('admin_token');
    }
  };

  const handleLogin = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const response = await fetch('/api/admin/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email, password }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Invalid credentials');
      }

      const accessToken = data.access_token;

      if (!accessToken) {
        throw new Error('No access token received');
      }

      // Save token to localStorage
      if (typeof window !== 'undefined') {
        localStorage.setItem('admin_token', accessToken);
      }

      setToken(accessToken);
      setIsAuthenticated(true);
    } catch (err) {
      console.error('Login error:', err);
      setError(err.message || 'Failed to connect to server. Make sure the backend is running on http://127.0.0.1:8000');
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = () => {
    if (typeof window !== 'undefined') {
      localStorage.removeItem('admin_token');
    }
    setToken('');
    setIsAuthenticated(false);
    setEmail('');
    setPassword('');
  };

  const openSQLAdmin = () => {
    const backendUrl = getBackendUrl();
    window.open(`${backendUrl}/admin`, '_blank');
  };

  if (!isAuthenticated) {
    return (
      <Container maxW="md">
        <Box mx="auto" mt={10} p={5} borderWidth={1} borderRadius="lg" boxShadow="md">
          <Heading mb={5} size="lg">Admin Login</Heading>
          <Text mb={5} color="gray.600" fontSize="sm">
            Enter your email and password to access the admin panel.
            You can use your superuser email or admin username.
          </Text>
          
          {error && (
            <Alert status="error" mb={4} borderRadius="md">
              <AlertIcon />
              {error}
            </Alert>
          )}

          <form onSubmit={handleLogin}>
            <VStack spacing={4}>
              <FormControl isRequired>
                <FormLabel>Email or Username</FormLabel>
                <Input 
                  type="text" 
                  value={email} 
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="admin or your@email.com"
                  autoComplete="username"
                />
              </FormControl>
              
              <FormControl isRequired>
                <FormLabel>Password</FormLabel>
                <Input 
                  type="password" 
                  value={password} 
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Enter your password"
                  autoComplete="current-password"
                />
              </FormControl>
              
              <Button 
                type="submit" 
                width="full" 
                colorScheme="blue"
                isLoading={loading}
                loadingText="Logging in..."
              >
                Login
              </Button>
            </VStack>
          </form>

          {/* <Box mt={6} pt={4} borderTopWidth={1}>
            <Text fontSize="sm" color="gray.600" mb={2}>
              Or access SQLAdmin directly:
            </Text>
            <Button 
              variant="outline" 
              width="full"
              onClick={openSQLAdmin}
            >
              Open SQLAdmin Panel
            </Button>
          </Box> */}
        </Box>
      </Container>
    );
  }

  return (
    <Container maxW="lg">
      <Box mx="auto" mt={10} p={5} borderWidth={1} borderRadius="lg" boxShadow="md">
        <Box display="flex" justifyContent="space-between" alignItems="center" mb={5}>
          <Heading size="lg">Admin Panel</Heading>
          <Button onClick={handleLogout} size="sm" variant="outline">
            Logout
          </Button>
        </Box>

        <VStack spacing={4} align="stretch">
          <Box p={4} bg="blue.50" borderRadius="md" borderWidth={1} borderColor="blue.200">
            <Heading size="md" mb={2}>SQLAdmin Panel</Heading>
            <Text mb={3} color="gray.700">
              Access the full admin interface with database management capabilities.
            </Text>
            <Button 
              onClick={openSQLAdmin}
              colorScheme="blue"
              width="full"
            >
              Open SQLAdmin
            </Button>
          </Box>

          <Box p={4} bg="gray.50" borderRadius="md">
            <Text fontSize="sm" color="gray.600">
              You are authenticated. Use the SQLAdmin panel above to manage your database.
            </Text>
          </Box>
        </VStack>
      </Box>
    </Container>
  );
}
