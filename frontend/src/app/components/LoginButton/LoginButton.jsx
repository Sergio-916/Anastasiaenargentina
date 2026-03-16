import {
Menu,
MenuButton,
MenuList,
Button,
Avatar,
MenuItem
} from "@chakra-ui/react";
import NextLink from "next/link";

function LoginButton({isLoading, user, logout, features}){

    return(    
   <>
  {!isLoading && features && (
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
   </>
    
)}

export default LoginButton

