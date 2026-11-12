"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { ClipboardList, UtensilsCrossed, Settings, HelpCircle } from "lucide-react";

const LINKS = [
  { href: "/admin", label: "Pedidos", icon: ClipboardList },
  { href: "/admin/produtos", label: "Cardápio", icon: UtensilsCrossed },
  { href: "/admin/configuracoes", label: "Configurações", icon: Settings },
  { href: "/admin/ajuda", label: "Ajuda", icon: HelpCircle },
];

export function AdminNavLinks() {
  const pathname = usePathname();

  return (
    <nav className="flex gap-1.5">
      {LINKS.map(({ href, label, icon: Icon }) => {
        const active = pathname === href;
        return (
          <Link
            key={href}
            href={href}
            className={`flex items-center gap-1.5 text-sm font-semibold px-3 py-2 rounded-lg transition ${
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
