import {
  AvatarSchema,
  PreferencesSchema,
  ProfileUpdateSchema,
} from "./user";

describe("user schemas", () => {
  test("accepts profile updates with optional nullable fields", () => {
    const parsed = ProfileUpdateSchema.parse({
      displayName: "Taylor User",
      bio: null,
      website: "https://example.com",
    });

    expect(parsed.bio).toBeNull();
    expect(parsed.website).toBe("https://example.com");
  });

  test("rejects insecure avatar urls", () => {
    const result = AvatarSchema.safeParse({
      url: "http://example.com/avatar.png",
    });

    expect(result.success).toBe(false);
  });

  test("defaults preferences flags", () => {
    const parsed = PreferencesSchema.parse({
      theme: "system",
      locale: "en-US",
      timezone: "UTC",
    });

    expect(parsed.marketingEmails).toBe(false);
    expect(parsed.productUpdates).toBe(true);
  });
});
