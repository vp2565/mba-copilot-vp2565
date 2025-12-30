import NextAuth from 'next-auth';
import Credentials from 'next-auth/providers/credentials';
import { authConfig } from './auth.config';

export const { handlers, auth, signIn, signOut } = NextAuth({
  ...authConfig,
  trustHost: true,
  session: {
    strategy: 'jwt',
    maxAge: 30 * 24 * 60 * 60, // 30 days
  },
  providers: [
    Credentials({
      credentials: {
        password: { label: 'Password', type: 'password' },
      },
      async authorize(credentials) {
        if (!credentials?.password) {
          return null;
        }

        // Check if password matches
        if (credentials.password !== process.env.AUTH_PASSWORD) {
          return null;
        }

        // Password is correct, return authenticated user
        return {
          id: 'user',
          email: 'user@mba-copilot',
        };
      },
    }),
  ],
});