import type { ReactNode } from "react";
import { Header } from "./Header";
import { PageContainer } from "./PageContainer";

interface LayoutProps {
  children: ReactNode;
}

/** Root page shell: header + constrained content area. Every page renders inside this. */
export function Layout({ children }: LayoutProps) {
  return (
    <div className="app-shell">
      <Header />
      <main className="app-main">
        <PageContainer>{children}</PageContainer>
      </main>
    </div>
  );
}
