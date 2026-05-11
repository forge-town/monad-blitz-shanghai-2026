import { betterAuth } from "better-auth";
import { getServerEnv } from "@/integrations/server-env";

const {
  BETTER_AUTH_SECRET,
  VITE_APP_URL,
  GITHUB_CLIENT_ID,
  GITHUB_CLIENT_SECRET,
  GOOGLE_CLIENT_ID,
  GOOGLE_CLIENT_SECRET,
  NODE_ENV,
} = getServerEnv();

export const auth = betterAuth({
  secret: BETTER_AUTH_SECRET,
  baseURL: VITE_APP_URL,
  emailAndPassword: {
    enabled: true,
    requireEmailVerification: false,
  },
  socialProviders: {
    github: GITHUB_CLIENT_ID
      ? {
          clientId: GITHUB_CLIENT_ID,
          clientSecret: GITHUB_CLIENT_SECRET ?? "",
          redirectURI: `${VITE_APP_URL}/api/auth/callback/github`,
        }
      : undefined,
    google: GOOGLE_CLIENT_ID
      ? {
          clientId: GOOGLE_CLIENT_ID,
          clientSecret: GOOGLE_CLIENT_SECRET ?? "",
          redirectURI: `${VITE_APP_URL}/api/auth/callback/google`,
        }
      : undefined,
  },
  trustedOrigins: [
    VITE_APP_URL,
    ...(NODE_ENV === "development"
      ? [
          "http://localhost:3001",
          "http://localhost:3002",
        ]
      : []),
  ],
  session: {
    expiresIn: 60 * 60 * 24 * 7,
    updateAge: 60 * 5,
    cookieCache: { enabled: true, maxAge: 60 * 60 * 24 * 7 },
  },
  advanced: { useSecureCookies: NODE_ENV === "production" },
});
