import type { Metadata, Viewport } from "next";

export const metadata: Metadata = {
  manifest: "/admin-manifest.webmanifest",
  appleWebApp: {
    capable: true,
    statusBarStyle: "black-translucent",
    title: "Painel Beh",
  },
  icons: {
    apple: "/icons/admin-icon-apple-180.png",
  },
};

export const viewport: Viewport = {
  themeColor: "#E8590C",
};

export default function AdminRootLayout({ children }: LayoutProps<"/admin">) {
  return children;
}
