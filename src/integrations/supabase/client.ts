// Supabase has been removed. This stub remains only so that any orphaned
// imports surface a loud, immediate error instead of a silent runtime crash.
// All data access now goes through `src/lib/api.ts` (Django REST API).

const fail = (): never => {
  throw new Error(
    "Supabase has been removed. Use `import { api } from \"@/lib/api\"` instead.",
  );
};

export const supabase = new Proxy({} as Record<string, unknown>, {
  get: fail,
  apply: fail,
});
