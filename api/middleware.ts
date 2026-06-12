import { ErrorMessages } from "@contracts/constants";
import { initTRPC, TRPCError } from "@trpc/server";
import superjson from "superjson";
import type { TrpcContext } from "./context";

const t = initTRPC.context<TrpcContext>().create({
  transformer: superjson,
});

export const createRouter = t.router;
export const publicQuery = t.procedure;

const requireAuth = t.middleware(async (opts) => {
  const { ctx, next } = opts;

  if (!ctx.user) {
    throw new TRPCError({
      code: "UNAUTHORIZED",
      message: ErrorMessages.unauthenticated,
    });
  }

  return next({ ctx: { ...ctx, user: ctx.user } });
});

// Role hierarchy: super_admin (3) > admin (2) > staff (1).
// A higher rank satisfies any lower-rank requirement, so super_admin passes
// every admin-gated procedure, while admin-only procedures still reject staff.
const ROLE_RANK: Record<string, number> = { staff: 1, admin: 2, super_admin: 3 };

function requireMinRole(minRole: keyof typeof ROLE_RANK) {
  return t.middleware(async (opts) => {
    const { ctx, next } = opts;
    const rank = ctx.user ? ROLE_RANK[ctx.user.role] ?? 0 : 0;

    if (!ctx.user || rank < ROLE_RANK[minRole]) {
      throw new TRPCError({
        code: "FORBIDDEN",
        message: ErrorMessages.insufficientRole,
      });
    }

    return next({ ctx: { ...ctx, user: ctx.user } });
  });
}

export const authedQuery = t.procedure.use(requireAuth);
export const adminQuery = authedQuery.use(requireMinRole("admin"));
export const superAdminQuery = authedQuery.use(requireMinRole("super_admin"));
