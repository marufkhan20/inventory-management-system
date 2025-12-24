import { ReactNode } from "react";

const layout = ({ children }: { children: ReactNode }) => {
  return (
    <main className="min-h-screen w-full flex items-center justify-center p-5">
      {children}
    </main>
  );
};

export default layout;
