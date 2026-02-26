"use client";

import { useState } from "react";
import {
  Input,
  InputGroup,
  InputRightElement,
  IconButton,
} from "@chakra-ui/react";
import { ViewIcon, ViewOffIcon } from "@chakra-ui/icons";

/**
 * Reusable password input with show/hide toggle.
 * Encapsulates InputGroup, Input, InputRightElement, and IconButton internally.
 */
export default function PasswordInput({
  value,
  onChange,
  placeholder,
  autoComplete,
  minLength,
  ...inputProps
}) {
  const [showPassword, setShowPassword] = useState(false);

  return (
    <InputGroup>
      <Input
        type={showPassword ? "text" : "password"}
        value={value}
        onChange={onChange}
        placeholder={placeholder}
        autoComplete={autoComplete}
        minLength={minLength}
        pr="2.5rem"
        {...inputProps}
      />
      <InputRightElement>
        <IconButton
          aria-label={showPassword ? "Hide password" : "Show password"}
          icon={showPassword ? <ViewOffIcon /> : <ViewIcon />}
          size="sm"
          variant="ghost"
          onClick={() => setShowPassword((prev) => !prev)}
        />
      </InputRightElement>
    </InputGroup>
  );
}
