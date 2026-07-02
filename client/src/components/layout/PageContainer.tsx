import type { ReactNode } from "react";

interface PageContainerProps {
  children: ReactNode;
}

/** Constrains content to a readable max width and applies consistent page padding. */
export function PageContainer({ children }: PageContainerProps) {
  return <div className="page-container">{children}</div>;
}
