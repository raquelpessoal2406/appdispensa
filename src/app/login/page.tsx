"use client";

import { useActionState } from "react";
import { login } from "./actions";

export default function LoginPage() {
  const [error, formAction, pending] = useActionState(login, undefined);

  return (
    <main className="flex flex-1 flex-col justify-center px-6 py-10">
      <h1 className="mb-1 text-2xl font-extrabold tracking-tight text-primary">
        Despensa
      </h1>
      <p className="mb-8 text-sm text-ink-soft">
        Entra com a tua conta para gerires a despensa.
      </p>

      <form action={formAction} className="flex flex-col gap-4">
        <div className="flex flex-col gap-1.5">
          <label htmlFor="email" className="text-sm font-semibold">
            Email
          </label>
          <input
            id="email"
            name="email"
            type="email"
            required
            autoComplete="email"
            className="rounded-[10px] border border-line bg-surface px-3.5 py-3 text-[15px] outline-none focus:border-primary"
          />
        </div>

        <div className="flex flex-col gap-1.5">
          <label htmlFor="password" className="text-sm font-semibold">
            Password
          </label>
          <input
            id="password"
            name="password"
            type="password"
            required
            autoComplete="current-password"
            className="rounded-[10px] border border-line bg-surface px-3.5 py-3 text-[15px] outline-none focus:border-primary"
          />
        </div>

        {error && (
          <p className="rounded-[10px] bg-danger-tint px-3.5 py-2.5 text-sm font-medium text-danger">
            {error}
          </p>
        )}

        <button
          type="submit"
          disabled={pending}
          className="mt-2 rounded-[10px] bg-primary px-4 py-3.5 text-[14.5px] font-bold text-white disabled:opacity-60"
        >
          {pending ? "A entrar…" : "Entrar"}
        </button>
      </form>
    </main>
  );
}
