"use client";

import { useEffect, useState } from "react";
import { Bell, BellOff, Smartphone, Loader2 } from "lucide-react";
import { saveSubscription, removeSubscription } from "@/app/admin/push-actions";

type Status = "checking" | "unsupported" | "ios-not-installed" | "denied" | "off" | "on" | "busy";

function urlBase64ToUint8Array(base64String: string) {
  const padding = "=".repeat((4 - (base64String.length % 4)) % 4);
  const base64 = (base64String + padding).replace(/-/g, "+").replace(/_/g, "/");
  const rawData = atob(base64);
  return Uint8Array.from([...rawData].map((c) => c.charCodeAt(0)));
}

function isIos() {
  return /iphone|ipad|ipod/i.test(window.navigator.userAgent);
}

function isStandalone() {
  return (
    window.matchMedia("(display-mode: standalone)").matches ||
    (window.navigator as unknown as { standalone?: boolean }).standalone === true
  );
}

export function PushNotificationsCard() {
  const [status, setStatus] = useState<Status>("checking");

  useEffect(() => {
    async function check() {
      if (!("serviceWorker" in navigator) || !("PushManager" in window)) {
        setStatus("unsupported");
        return;
      }
      if (isIos() && !isStandalone()) {
        setStatus("ios-not-installed");
        return;
      }
      if (Notification.permission === "denied") {
        setStatus("denied");
        return;
      }
      const registration = await navigator.serviceWorker.register("/sw.js");
      const existing = await registration.pushManager.getSubscription();
      setStatus(existing ? "on" : "off");
    }
    check();
  }, []);

  async function activate() {
    setStatus("busy");
    try {
      const permission = await Notification.requestPermission();
      if (permission !== "granted") {
        setStatus(permission === "denied" ? "denied" : "off");
        return;
      }
      const registration = await navigator.serviceWorker.register("/sw.js");
      const subscription = await registration.pushManager.subscribe({
        userVisibleOnly: true,
        applicationServerKey: urlBase64ToUint8Array(process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY!),
      });
      const json = subscription.toJSON() as { endpoint: string; keys: { p256dh: string; auth: string } };
      await saveSubscription({ endpoint: json.endpoint, keys: json.keys });
      setStatus("on");
    } catch {
      setStatus("off");
    }
  }

  async function deactivate() {
    setStatus("busy");
    try {
      const registration = await navigator.serviceWorker.register("/sw.js");
      const subscription = await registration.pushManager.getSubscription();
      if (subscription) {
        await removeSubscription(subscription.endpoint);
        await subscription.unsubscribe();
      }
      setStatus("off");
    } catch {
      setStatus("on");
    }
  }

  if (status === "checking" || status === "unsupported") return null;

  return (
    <div className="bg-surface border border-border rounded-2xl p-5">
      <div className="flex items-center gap-2.5 mb-3">
        <div className="w-9 h-9 rounded-lg bg-chip flex items-center justify-center flex-shrink-0">
          <Bell size={17} className="text-accent-dark" />
        </div>
        <h3 className="font-display font-bold text-heading text-base">Notificações no celular</h3>
      </div>

      {status === "ios-not-installed" && (
        <p className="text-sm text-foreground/90 leading-relaxed flex items-start gap-2">
          <Smartphone size={16} className="text-muted flex-shrink-0 mt-0.5" />
          No iPhone, primeiro adicione o painel à tela inicial (veja a seção &quot;Instalar o painel
          como app no celular&quot; no Como usar) — aí a opção de notificação aparece aqui.
        </p>
      )}

      {status === "denied" && (
        <p className="text-sm text-muted leading-relaxed">
          As notificações estão bloqueadas pro navegador. Ative de volta nas configurações do
          navegador/celular pra esse site e recarregue a página.
        </p>
      )}

      {status === "off" && (
        <>
          <p className="text-sm text-muted leading-relaxed mb-4">
            Receba um aviso direto na tela do celular quando chegar um pedido novo — funciona mesmo
            com a tela bloqueada ou o app em segundo plano.
          </p>
          <button
            onClick={activate}
            className="bg-accent text-accent-ink font-bold text-sm px-4 py-2.5 rounded-xl hover:brightness-95 active:scale-[0.99] transition flex items-center gap-2"
          >
            <Bell size={15} />
            Ativar notificações neste aparelho
          </button>
        </>
      )}

      {status === "on" && (
        <>
          <p className="text-sm text-[#166534] font-semibold mb-4 flex items-center gap-1.5">
            <Bell size={15} />
            Notificações ativadas neste aparelho
          </p>
          <button
            onClick={deactivate}
            className="text-muted text-sm font-semibold hover:text-foreground transition flex items-center gap-1.5"
          >
            <BellOff size={14} />
            Desativar
          </button>
        </>
      )}

      {status === "busy" && (
        <p className="text-sm text-muted flex items-center gap-2">
          <Loader2 size={15} className="animate-spin" />
          Um instante...
        </p>
      )}
    </div>
  );
}
