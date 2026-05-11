import { useState } from "react";
import { Link, useNavigate } from "@tanstack/react-router";
import { useTranslation } from "react-i18next";
import { signUpWithEmail } from "@/integrations/better-auth-client";

export const SignUpPage = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const handleNameChange = (e: React.ChangeEvent<HTMLInputElement>) => setName(e.target.value);
  const handleEmailChange = (e: React.ChangeEvent<HTMLInputElement>) => setEmail(e.target.value);
  const handlePasswordChange = (e: React.ChangeEvent<HTMLInputElement>) => setPassword(e.target.value);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    const result = await signUpWithEmail({ name, email, password, callbackURL: "/" });

    if (result.isOk()) {
      navigate({ to: "/" });
    } else {
      setError(result.error.message);
    }

    setLoading(false);
  };

  return (
    <div className="flex min-h-screen items-center justify-center">
      <div className="w-full max-w-sm space-y-6 px-4">
        <h1 className="text-center text-2xl font-bold">{t("auth.signUp")}</h1>

        {error ? (
          <div className="rounded-md border border-red-200 bg-red-50 p-3 text-sm text-red-600">
            {error}
          </div>
        ) : null}

        <form className="space-y-4" onSubmit={handleSubmit}>
          <div className="space-y-2">
            <label className="text-sm font-medium" htmlFor="name">
              {t("auth.name")}
            </label>
            <input
              required
              className="border-input w-full rounded-md border px-3 py-2"
              id="name"
              type="text"
              value={name}
              onChange={handleNameChange}
            />
          </div>
          <div className="space-y-2">
            <label className="text-sm font-medium" htmlFor="email">
              {t("auth.email")}
            </label>
            <input
              required
              className="border-input w-full rounded-md border px-3 py-2"
              id="email"
              type="email"
              value={email}
              onChange={handleEmailChange}
            />
          </div>
          <div className="space-y-2">
            <label className="text-sm font-medium" htmlFor="password">
              {t("auth.password")}
            </label>
            <input
              required
              className="border-input w-full rounded-md border px-3 py-2"
              id="password"
              minLength={8}
              type="password"
              value={password}
              onChange={handlePasswordChange}
            />
          </div>
          <button
            className="bg-primary text-primary-foreground w-full rounded-md py-2 font-medium disabled:opacity-50"
            disabled={loading}
            type="submit"
          >
            {loading ? t("common.loading") : t("auth.signUp")}
          </button>
        </form>

        <p className="text-muted-foreground text-center text-sm">
          {t("auth.hasAccount")}{" "}
          <Link className="text-primary underline" to="/login">
            {t("auth.login")}
          </Link>
        </p>
      </div>
    </div>
  );
};
