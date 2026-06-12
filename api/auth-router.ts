import { z } from "zod";
import * as cookie from "cookie";
import { eq } from "drizzle-orm";
import { TRPCError } from "@trpc/server";
import { Session } from "@contracts/constants";
import { getSessionCookieOptions } from "./lib/cookies";
import { createRouter, authedQuery, publicQuery } from "./middleware";
import { getDb } from "./queries/connection";
import { users } from "@db/schema";
import { signSessionToken } from "./kimi/session";
import { env } from "./lib/env";
import { isDevAuth } from "./lib/dev-auth";

export const authRouter = createRouter({
  me: authedQuery.query((opts) => opts.ctx.user),
  logout: authedQuery.mutation(async ({ ctx }) => {
    const opts = getSessionCookieOptions(ctx.req.headers);
    ctx.resHeaders.append(
      "set-cookie",
      cookie.serialize(Session.cookieName, "", {
        httpOnly: opts.httpOnly,
        path: opts.path,
        sameSite: opts.sameSite?.toLowerCase() as "lax" | "none",
        secure: opts.secure,
        maxAge: 0,
      }),
    );
    return { success: true };
  }),

  // ─── Local dev-only admin login (email + password) ───
  // Issues the same kimi_sid session cookie that OAuth would, so all
  // admin-gated tRPC procedures work locally without a Kimi OAuth server.
  devLogin: publicQuery
    .input(z.object({ email: z.string().min(1), password: z.string().min(1) }))
    .mutation(async ({ ctx, input }) => {
      if (!isDevAuth()) {
        throw new TRPCError({ code: "FORBIDDEN", message: "Dev auth is disabled" });
      }
      const db = getDb();
      const [user] = await db.select().from(users).where(eq(users.email, input.email));
      if (!user || user.password !== input.password) {
        throw new TRPCError({ code: "UNAUTHORIZED", message: "Invalid email or password" });
      }
      if (user.role !== "admin" && user.role !== "super_admin") {
        throw new TRPCError({ code: "FORBIDDEN", message: "Not an admin account" });
      }
      const token = await signSessionToken({
        unionId: user.unionId ?? `dev-${user.id}`,
        clientId: env.appId || "udaan24-local",
      });
      const opts = getSessionCookieOptions(ctx.req.headers);
      ctx.resHeaders.append(
        "set-cookie",
        cookie.serialize(Session.cookieName, token, {
          httpOnly: opts.httpOnly,
          path: opts.path,
          sameSite: opts.sameSite?.toLowerCase() as "lax" | "none",
          secure: opts.secure,
          maxAge: Session.maxAgeMs / 1000,
        }),
      );
      return { id: user.id, name: user.name, email: user.email, role: user.role };
    }),
});
