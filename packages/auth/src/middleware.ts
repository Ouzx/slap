import type { MiddlewareHandler } from "hono";

export interface AuthSession {
  session: {
    id: string;
  };
  user: {
    id: string;
    role?: string | null;
  } & Record<string, unknown>;
}

export interface SessionResolver {
  getSession(request: Request): Promise<AuthSession | null>;
}

type AuthVariables = {
  Variables: {
    auth: AuthSession;
  };
};

export function requireAuth(resolver: SessionResolver): MiddlewareHandler<AuthVariables> {
  return async (c, next) => {
    const session = await resolver.getSession(c.req.raw);

    if (!session) {
      return c.json({ error: "Unauthorized" }, 401);
    }

    c.set("auth", session);
    await next();
  };
}

export function requireRole(
  role: string,
  resolver: SessionResolver,
): MiddlewareHandler<AuthVariables> {
  return async (c, next) => {
    const session = c.get("auth") ?? (await resolver.getSession(c.req.raw));

    if (!session) {
      return c.json({ error: "Unauthorized" }, 401);
    }

    if (session.user.role !== role) {
      return c.json({ error: "Forbidden" }, 403);
    }

    c.set("auth", session);
    await next();
  };
}
