"use client";

import AuthLoader from "@/components/AuthLoader";
import { useSession } from "@/lib/auth-client";
import { useRouter } from "next/navigation";
import { ReactNode } from "react";

const Layout = ({ children }: { children: ReactNode }) => {
  const { data: session, isPending } = useSession();
  const router = useRouter();

  if (isPending) {
    return <AuthLoader />;
  }

  if (session) {
    return router.push("/");
  }
  return (
    <main className="min-h-screen w-full flex items-center justify-center p-5">
      {children}
    </main>
  );
};

export default Layout;
