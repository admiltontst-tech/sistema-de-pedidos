"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { ClipboardList, UtensilsCrossed, Settings, HelpCircle, ShieldCheck, LayoutGrid } from "lucide-react";
import type { StaffRole } from "@/lib/types";

const ADMIN_LINKS = [
  { href: "/admin", label: "Pedidos", icon: ClipboardList },
  { href: "/admin/produtos", label: "Cardápio", icon: UtensilsCrossed },
  { href: "/admin/mesas", label: "Mesas", icon: LayoutGrid },
  { href: "/admin/configuracoes", label: "Configurações", icon: Settings },
  { href: "/admin/privacidade", label: "Privacidade", icon: ShieldCheck },
  { href: "/admin/ajuda", label: "Ajuda", icon: HelpCircle },
];

const GARCOM_LINKS = [{ href: "/admin/mesas", label: "Mesas", icon: LayoutGrid }];

export function AdminNavLinks({ role = "admin" }: { role?: StaffRole }) {
  const pathname = usePathname();
  const links = role === "garcom" ? GARCOM_LINKS : ADMIN_LINKS;

  return (
    <nav className="flex gap-1.5 overflow-x-auto [&::-webkit-scrollbar]:hidden -mx-5 px-5 sm:mx-0 sm:px-0">
      {links.map(({ href, label, icon: Icon }) => {
        const active = href === "/admin" ? pathname === href : pathname.startsWith(href);
        return (
          <Link
            key={href}
            href={href}
            className={`flex items-center gap-1.5 text-sm font-semibold px-3 py-2 rounded-lg transition whitespace-nowrap flex-shrink-0 ${
              active ? "bg-chip text-accent-dark" : "text-muted hover:text-foreground"
            }`}
          >
            <Icon size={15} />
            {label}
          </Link>
        );
      })}
    </nav>
  );
}
