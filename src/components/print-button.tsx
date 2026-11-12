"use client";

import { Printer } from "lucide-react";

export function PrintButton() {
  return (
    <button
      onClick={() => window.print()}
      className="print:hidden flex items-center gap-2 bg-accent text-accent-ink font-bold text-sm px-5 py-2.5 rounded-lg hover:brightness-95 transition"
    >
      <Printer size={16} />
      Imprimir
    </button>
  );
}
