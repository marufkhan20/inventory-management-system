import { betterAuth } from "better-auth";
import { prismaAdapter } from "better-auth/adapters/prisma";
import { nextCookies } from "better-auth/next-js";
import prisma from "./prisma";

const prismaProxy = new Proxy(prisma, {
  get(target, prop) {
    if (typeof prop === "string" && prop[0] === prop[0].toUpperCase()) {
      return target[prop.toLowerCase()];
    }
    return target[prop];
  },
});

export const auth = betterAuth({
  database: prismaAdapter(prismaProxy, {
    provider: "postgresql",
  }),
  emailAndPassword: {
    enabled: true,
  },
  plugins: [nextCookies()],
});
