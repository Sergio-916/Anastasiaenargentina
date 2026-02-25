"use client";
import {
  Image,
  Avatar,
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

import { RxHamburgerMenu } from "react-icons/rx";
import { useAuth } from "@/contexts/AuthContext";

export const menuItems = [
  "Главная",
  "Экскурсии",
  "Блог",
  "Обо мне",
  "Контакты",
];
export const menuRoures = ["/", "/tours","/blog", "/about", "/contacts"];
function Header() {
  const logo = "/logo.svg";
  const { user, isLoading, logout } = useAuth();

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
              <Link as={NextLink} href={menuRoures[index]} >
                {item}
              </Link>
            </Button>
          ))}
          {!isLoading && (
            user ? (
              <Menu>
                <MenuButton
                  as={Button}
                  variant="ghost"
                  color="white"
                  _hover={{ bg: "teal.600" }}
                  leftIcon={<Avatar size="sm" name={user.full_name || user.email} src={user.image} />}
                >
                  {user.full_name || user.email}
                </MenuButton>
                <MenuList zIndex={1000}>
                  <MenuItem onClick={logout}>Выйти</MenuItem>
                </MenuList>
              </Menu>
            ) : (
              <Button
                as={NextLink}
                href="/login"
                colorScheme="whiteAlpha"
                color="white"
                variant="outline"
                size="sm"
              >
                Войти
              </Button>
            )
          )}
        </Box>
        <Box display={{ base: "flex", lg: "none" }} justifyContent="flex-end" alignItems="center" gap={2}>
          {!isLoading && (
            user ? (
              <Menu>
                <MenuButton
                  as={Button}
                  variant="ghost"
                  color="white"
                  _hover={{ bg: "teal.600" }}
                  leftIcon={<Avatar size="sm" name={user.full_name || user.email} src={user.image} />}
                  size="sm"
                >
                  {user.full_name || user.email}
                </MenuButton>
                <MenuList zIndex={1000}>
                  <MenuItem onClick={logout}>Выйти</MenuItem>
                </MenuList>
              </Menu>
            ) : (
              <Button
                as={NextLink}
                href="/login"
                colorScheme="whiteAlpha"
                color="white"
                variant="outline"
                size="sm"
              >
                Войти
              </Button>
            )
          )}
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
                  <Link as={NextLink} href={menuRoures[index]} w="full">
                    {item}
                  </Link>
                </MenuItem>
              ))}
              {!isLoading && user && (
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
