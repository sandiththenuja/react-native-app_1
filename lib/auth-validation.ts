export function isValidEmail(email: string) {
  const normalizedEmail = email.trim();
  return (
    normalizedEmail.length <= 254 &&
    /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(normalizedEmail)
  );
}

export function isValidPassword(password: string) {
  return password.length >= 8;
}

export function isValidVerificationCode(code: string) {
  return /^\d{4,10}$/.test(code.trim());
}

export function getAuthErrorMessage(error: unknown, fallback: string) {
  if (error instanceof Error && error.message.trim()) {
    return error.message;
  }

  if (
    typeof error === "object" &&
    error !== null &&
    "message" in error &&
    typeof error.message === "string" &&
    error.message.trim()
  ) {
    return error.message;
  }

  return fallback;
}

export function isAccountNotFoundError(error: unknown) {
  if (
    typeof error !== "object" ||
    error === null ||
    !("code" in error) ||
    typeof error.code !== "string"
  ) {
    return false;
  }

  return (
    error.code === "form_identifier_not_found" ||
    error.code === "identifier_not_found"
  );
}
