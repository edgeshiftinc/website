import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Admin',
  robots: { index: false, follow: false }, // never indexed by search engines
};

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
