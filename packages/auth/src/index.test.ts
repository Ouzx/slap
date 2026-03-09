import { Hono } from "hono";

import {
  createAuthClient,
  requireAuth,
  requireRole,
} from "./index";

describe("auth", () => {
  test("creates a Better Auth client bound to a base URL", () => {
    const client = createAuthClient({
      baseURL: "https://slap.dev",
    });

    expect(client).toBeDefined();
  });

  test("requireAuth blocks anonymous requests", async () => {
    const app = new Hono();

    app.use(
      "*",
      requireAuth({
        getSession: async () => null,
      }),
    );
    app.get("/", (c) => c.text("ok"));

    const response = await app.request("https://slap.dev/");

    expect(response.status).toBe(401);
  });

  test("requireRole blocks users without the required role", async () => {
    const app = new Hono();

    app.use(
      "*",
      requireRole("admin", {
        getSession: async () => ({
          session: { id: "session_1" },
          user: { id: "user_1", role: "member" },
        }),
      }),
    );
    app.get("/", (c) => c.text("ok"));

    const response = await app.request("https://slap.dev/");

    expect(response.status).toBe(403);
  });
});
