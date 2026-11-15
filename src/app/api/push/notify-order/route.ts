import { NextResponse, type NextRequest } from "next/server";
import * as webpush from "web-push";
import { createAdminClient } from "@/lib/supabase/admin";
import { formatMoney } from "@/lib/money";

export async function POST(request: NextRequest) {
  const secret = request.headers.get("x-webhook-secret");
  if (!secret || secret !== process.env.PUSH_WEBHOOK_SECRET) {
    return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  }

  const { order_id } = (await request.json()) as { order_id?: string };
  if (!order_id) {
    return NextResponse.json({ error: "missing order_id" }, { status: 400 });
  }

  const admin = createAdminClient();

  const [{ data: order }, { data: subscriptions }] = await Promise.all([
    admin.from("orders").select("customer_name, total_cents, delivery_type").eq("id", order_id).single(),
    admin.from("push_subscriptions").select("endpoint, p256dh, auth"),
  ]);

  if (!order || !subscriptions || subscriptions.length === 0) {
    return NextResponse.json({ sent: 0 });
  }

  webpush.setVapidDetails(
    process.env.VAPID_SUBJECT!,
    process.env.VAPID_PUBLIC_KEY!,
    process.env.VAPID_PRIVATE_KEY!
  );

  const kindLabel =
    order.delivery_type === "delivery" ? "Entrega" : order.delivery_type === "pickup" ? "Retirada" : "Salão";
  const payload = JSON.stringify({
    title: `Novo pedido de ${order.customer_name}`,
    body: `${kindLabel} — ${formatMoney(order.total_cents)}`,
    url: "/admin",
  });

  const expiredEndpoints: string[] = [];

  await Promise.all(
    subscriptions.map(async (sub) => {
      try {
        await webpush.sendNotification(
          { endpoint: sub.endpoint, keys: { p256dh: sub.p256dh, auth: sub.auth } },
          payload
        );
      } catch (err) {
        const statusCode = (err as { statusCode?: number }).statusCode;
        if (statusCode === 404 || statusCode === 410) {
          expiredEndpoints.push(sub.endpoint);
        }
      }
    })
  );

  if (expiredEndpoints.length > 0) {
    await admin.from("push_subscriptions").delete().in("endpoint", expiredEndpoints);
  }

  return NextResponse.json({ sent: subscriptions.length - expiredEndpoints.length });
}
