"use client";
import {
  Image,
  Box,
  Button,
  Flex,
  Menu,
  MenuButton,
  IconButton,
  MenuList,
  MenuItem,
  Link,
} from "@chakra-ui/react";
import NextLink from "next/link";
import { useState, useEffect } from "react";
import { RxHamburgerMenu } from "react-icons/rx";
import { useAuth } from "@/contexts/AuthContext";
import LoginButton from "./LoginButton/LoginButton";
import { getBackendUrl } from "@/utils/settings";

export const menuItems = [
  "Главная",
  "Экскурсии",
  "Блог",
  "Обо мне",
  "Контакты",
];
export const menuRoutes = ["/", "/tours","/blog", "/about", "/contacts"];
function Header() {
  const logo = "/logo.svg";
  const { user, isLoading, logout } = useAuth();

  const [features, setFeatures] = useState(null);

  useEffect(() => {
    const fetchFeatureFlag = async () => {
      try {
        const response = await fetch(`${getBackendUrl()}/api/v1/utils/features`);

        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
        const fetchData = await response.json();
        setFeatures(fetchData.registration_enabled);

      } catch (err) {
        console.error("Feature flag fetch failed:", err);
      }
    };
    fetchFeatureFlag();
  }, []);

  return (
    <>    
      <Flex
        as="nav"
        align="center"
        justify="space-between"
        padding="1.2rem"
        bg="teal.500"
        color="Grey.600"
      >
        <Link as={NextLink} href="/" >
             <Image src={logo} w={["180px", "280px", "280px"]} />
            </Link>
        <Box
          display={{ base: "none", lg: "flex" }}
          width={{ md: "auto" }}
          alignItems="center"
          justifyContent="flex-end"
          flexGrow={1}
          gap={2}
        >
          {menuItems.map((item, index) => (
            <Button
              key={index}
              variant="ghost"
              color="white"
              _hover={{ bg: "teal.600" }}
              fontSize={['md','lg','xl']}
            >
              <Link as={NextLink} href={menuRoutes[index]} >
                {item}
              </Link>
            </Button>
          ))}
          <LoginButton isLoading={isLoading} user={user} logout={logout} features={features}/>
        </Box>
        <Box display={{ base: "flex", lg: "none" }} justifyContent="flex-end" alignItems="center" gap={2}>
        <LoginButton isLoading={isLoading} user={user} logout={logout} features={features}/>
          <Menu>
            <MenuButton
              as={IconButton}
              icon={<RxHamburgerMenu size={25} color="white" />}
              variant="outline"
              color="teal.900"
            />
            <MenuList zIndex={1000}>
              {menuItems.map((item, index) => (
                <MenuItem key={index}>
                  <Link as={NextLink} href={menuRoutes[index]} w="full">
                    {item}
                  </Link>
                </MenuItem>
              ))}
              {!isLoading && user && features && (
                <MenuItem onClick={logout}>Выйти</MenuItem>
              )}
            </MenuList>
          </Menu>
        </Box>
      </Flex>
    </>
  );
}

export default Header;
