import {
  createLogger,
  formatJsonLog,
  formatPrettyLog,
  redactPayload,
} from "./index";

describe("logger", () => {
  test("uses an incoming request id and redacts configured fields", () => {
    const entries: string[] = [];
    const logger = createLogger({
      format: "json",
      redact: ["password", "profile.token"],
      now: () => "2026-03-08T20:00:00.000Z",
      request: new Request("https://slap.dev", {
        headers: { "x-request-id": "req_existing" },
      }),
      sink: (entry) => {
        entries.push(entry);
      },
    });

    logger.info("user signed in", {
      password: "secret",
      profile: { token: "abc123" },
    });

    expect(entries).toHaveLength(1);
    expect(JSON.parse(entries[0])).toMatchObject({
      level: "info",
      message: "user signed in",
      requestId: "req_existing",
      password: "[REDACTED]",
      profile: { token: "[REDACTED]" },
    });
  });

  test("generates a request id when one is not supplied", () => {
    const entries: string[] = [];
    const logger = createLogger({
      format: "json",
      idFactory: () => "req_generated",
      now: () => "2026-03-08T20:00:00.000Z",
      sink: (entry) => {
        entries.push(entry);
      },
    });

    logger.error("boom", { code: "E_BANG" });

    expect(JSON.parse(entries[0]).requestId).toBe("req_generated");
  });

  test("formats pretty logs for console sinks", () => {
    const rendered = formatPrettyLog({
      level: "warn",
      message: "rate limited",
      requestId: "req_123",
      time: "2026-03-08T20:00:00.000Z",
      service: "api",
    });

    expect(rendered).toContain("[warn]");
    expect(rendered).toContain("rate limited");
    expect(rendered).toContain("req_123");
    expect(rendered).toContain("service=api");
  });

  test("formats JSON logs as a single line", () => {
    const rendered = formatJsonLog({
      level: "info",
      message: "ok",
      requestId: "req_123",
      time: "2026-03-08T20:00:00.000Z",
    });

    expect(rendered).toBe(
      '{"level":"info","message":"ok","requestId":"req_123","time":"2026-03-08T20:00:00.000Z"}',
    );
  });

  test("redacts nested payload values", () => {
    expect(
      redactPayload(
        {
          email: "person@example.com",
          credentials: { password: "secret" },
          tokens: [{ value: "keep" }, { value: "hide" }],
        },
        ["credentials.password", "tokens.1.value"],
      ),
    ).toEqual({
      email: "person@example.com",
      credentials: { password: "[REDACTED]" },
      tokens: [{ value: "keep" }, { value: "[REDACTED]" }],
    });
  });
});
