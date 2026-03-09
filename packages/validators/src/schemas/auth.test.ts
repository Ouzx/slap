import {
  LoginSchema,
  MagicLinkSchema,
  RegisterSchema,
  ResetPasswordSchema,
} from "./auth";

describe("auth schemas", () => {
  test("accepts valid login payloads", () => {
    const parsed = LoginSchema.parse({
      email: "USER@example.com",
      password: "correct horse battery staple",
      remember: true,
    });

    expect(parsed.email).toBe("user@example.com");
    expect(parsed.remember).toBe(true);
  });

  test("rejects short passwords during registration", () => {
    const result = RegisterSchema.safeParse({
      email: "person@example.com",
      name: "Pat Example",
      password: "short",
      confirmPassword: "short",
      acceptTerms: true,
    });

    expect(result.success).toBe(false);
  });

  test("requires matching confirmation passwords", () => {
    const result = ResetPasswordSchema.safeParse({
      token: "0123456789abcdef",
      password: "password-123",
      confirmPassword: "password-124",
    });

    expect(result.success).toBe(false);
  });

  test("allows magic link redirect urls", () => {
    const parsed = MagicLinkSchema.parse({
      email: "hello@example.com",
      redirectTo: "https://slap.dev/auth/callback",
    });

    expect(parsed.redirectTo).toBe("https://slap.dev/auth/callback");
  });
});
