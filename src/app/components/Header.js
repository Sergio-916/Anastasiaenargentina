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

import { RxHamburgerMenu } from "react-icons/rx";

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
        </Box>
        <Box display={{ base: "flex", lg: "none" }} justifyContent="flex-end">
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
                  <Link as={NextLink} href={menuRoures[index]} >
                    {item}
                  </Link>
                </MenuItem>
              ))}
            </MenuList>
          </Menu>
        </Box>
      </Flex>
    </>
  );
}

export default Header;
