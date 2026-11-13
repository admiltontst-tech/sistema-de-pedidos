"use client";

import { useMemo, useState } from "react";
import Image from "next/image";
import {
  ShoppingCart,
  X,
  Plus,
  Minus,
  Clock,
  MapPin,
  ShieldCheck,
  CheckCircle2,
  MessageCircle,
  Bike,
  Megaphone,
} from "lucide-react";
import { useCartStore, cartTotalCents, cartCount } from "@/lib/cart-store";
import { formatMoney } from "@/lib/money";
import { createOrder } from "@/app/actions";
import type {
  CartItem,
  CategoryWithProducts,
  DeliveryType,
  PaymentMethod,
  Product,
  StoreSettings,
} from "@/lib/types";

function Thumb({ product, size }: { product: Product; size: number }) {
  if (product.image_url) {
    return (
      <Image
        src={product.image_url}
        alt={product.name}
        width={size}
        height={size}
        className="rounded-xl object-cover flex-shrink-0"
        style={{ width: size, height: size }}
      />
    );
  }
  return (
    <div
      className="rounded-xl flex-shrink-0 bg-gradient-to-br from-[#E8A33D] to-[#8E3B1F] flex items-center justify-center text-white font-display font-bold text-[10px]"
      style={{ width: size, height: size }}
    >
      {product.name.slice(0, 3).toUpperCase()}
    </div>
  );
}

function ProductRow({ product, onAdd }: { product: Product; onAdd: (p: Product) => void }) {
  return (
    <div className="flex items-center gap-3 p-3.5 border-b border-border-soft last:border-b-0">
      <Thumb product={product} size={48} />
      <div className="flex-1 min-w-0">
        <div className="font-semibold text-foreground text-[14.5px] truncate">{product.name}</div>
        {product.description && (
          <div className="text-muted text-xs mt-0.5 truncate">{product.description}</div>
        )}
      </div>
      <span className="font-bold text-accent text-[14.5px] whitespace-nowrap">
        {formatMoney(product.price_cents)}
      </span>
      <button
        aria-label={`Adicionar ${product.name}`}
        onClick={() => onAdd(product)}
        className="w-8 h-8 rounded-full bg-accent text-accent-ink flex items-center justify-center flex-shrink-0 hover:brightness-95 transition"
      >
        <Plus size={16} strokeWidth={2.5} />
      </button>
    </div>
  );
}

function FeaturedCard({ product, onAdd }: { product: Product; onAdd: (p: Product) => void }) {
  return (
    <div className="bg-surface border border-border rounded-2xl overflow-hidden shadow-sm relative">
      {product.badge && (
        <span className="absolute top-2.5 left-2.5 bg-[#D62828] text-white text-[11px] font-bold px-2.5 py-1 rounded-full z-10">
          {product.badge}
        </span>
      )}
      <div className="h-[120px] relative bg-chip">
        {product.image_url ? (
          <Image src={product.image_url} alt={product.name} fill className="object-cover" />
        ) : null}
      </div>
      <div className="p-3.5">
        <div className="font-bold text-heading text-[15px]">{product.name}</div>
        <div className="text-muted text-[12.5px] mt-1 min-h-[32px]">{product.description}</div>
        <div className="flex items-center justify-between mt-2.5">
          <span className="font-extrabold text-accent text-base">
            {formatMoney(product.price_cents)}
          </span>
          <button
            onClick={() => onAdd(product)}
            className="bg-accent text-accent-ink font-bold text-sm px-4 py-2 rounded-lg hover:brightness-95 transition"
          >
            Adicionar
          </button>
        </div>
      </div>
    </div>
  );
}

function BuilderModal({
  product,
  onClose,
  onConfirm,
}: {
  product: Product;
  onClose: () => void;
  onConfirm: (name: string, priceCents: number, selected: Record<string, string[]>) => void;
}) {
  const [selections, setSelections] = useState<Record<string, string[]>>({});

  const priceCents = useMemo(() => {
    let total = product.price_cents;
    for (const group of product.product_option_groups) {
      const chosen = selections[group.name] ?? [];
      for (const label of chosen) {
        const opt = group.product_options.find((o) => o.label === label);
        if (opt) total += opt.price_delta_cents;
      }
    }
    return total;
  }, [selections, product]);

  const missingRequired = product.product_option_groups.filter(
    (g) => g.required && (selections[g.name] ?? []).length === 0
  );

  function pickSingle(groupName: string, label: string) {
    setSelections((s) => ({ ...s, [groupName]: [label] }));
  }

  function toggleMultiple(groupName: string, label: string, maxSelect: number | null) {
    setSelections((s) => {
      const current = s[groupName] ?? [];
      const has = current.includes(label);
      if (has) return { ...s, [groupName]: current.filter((l) => l !== label) };
      if (maxSelect && current.length >= maxSelect) return s;
      return { ...s, [groupName]: [...current, label] };
    });
  }

  function confirm() {
    if (missingRequired.length > 0) return;
    const parts = product.product_option_groups
      .filter((g) => (selections[g.name] ?? []).length > 0)
      .map((g) => `${g.name.toLowerCase()}: ${(selections[g.name] ?? []).join(", ")}`);
    const name = parts.length ? `${product.name} (${parts.join("; ")})` : product.name;
    onConfirm(name, priceCents, selections);
  }

  return (
    <div
      className="fixed inset-0 bg-[#28190a]/45 backdrop-blur-[2px] z-40 flex items-center justify-center p-4"
      onClick={onClose}
    >
      <div
        className="bg-surface rounded-[20px] border border-border w-full max-w-xl max-h-[88vh] flex flex-col"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between p-4 border-b border-border-soft">
          <h3 className="font-display font-bold text-heading text-[17px]">{product.name}</h3>
          <button
            aria-label="Fechar"
            onClick={onClose}
            className="w-9 h-9 rounded-full bg-chip flex items-center justify-center"
          >
            <X size={16} />
          </button>
        </div>
        <div className="flex-1 overflow-y-auto p-5 flex flex-col gap-5">
          {product.product_option_groups.map((group) => (
            <div key={group.id}>
              <div className="flex items-center gap-2 font-bold text-[13px] text-accent-dark uppercase tracking-wide mb-2.5">
                {group.name}
                {group.required && <span className="text-[11px] font-semibold opacity-70">(obrigatório)</span>}
                {group.type === "multiple" && group.max_select && (
                  <span className="text-[11px] font-semibold opacity-70">(até {group.max_select})</span>
                )}
              </div>
              <div className="flex flex-wrap gap-2">
                {group.product_options.map((opt) => {
                  const selected = (selections[group.name] ?? []).includes(opt.label);
                  return (
                    <button
                      key={opt.id}
                      onClick={() =>
                        group.type === "single"
                          ? pickSingle(group.name, opt.label)
                          : toggleMultiple(group.name, opt.label, group.max_select)
                      }
                      className={`px-3.5 py-2 rounded-lg border-[1.5px] text-[13px] font-semibold transition ${
                        selected
                          ? "border-accent bg-accent/10 text-accent-dark"
                          : "border-border bg-surface text-foreground/80"
                      }`}
                    >
                      {opt.label}
                      {opt.price_delta_cents > 0 && ` · +${formatMoney(opt.price_delta_cents)}`}
                    </button>
                  );
                })}
              </div>
            </div>
          ))}
        </div>
        <div className="p-4 border-t border-border-soft flex items-center justify-between gap-4">
          <div>
            <div className="text-muted text-xs">Total do prato</div>
            <div className="font-extrabold text-xl text-heading">{formatMoney(priceCents)}</div>
          </div>
          <button
            disabled={missingRequired.length > 0}
            onClick={confirm}
            className="bg-accent text-accent-ink font-bold text-sm px-6 py-3 rounded-lg disabled:opacity-40 hover:brightness-95 transition"
          >
            Adicionar ao carrinho
          </button>
        </div>
      </div>
    </div>
  );
}

function CartDrawer({
  items,
  onClose,
  onInc,
  onDec,
  onCheckout,
}: {
  items: CartItem[];
  onClose: () => void;
  onInc: (key: string) => void;
  onDec: (key: string) => void;
  onCheckout: () => void;
}) {
  const total = cartTotalCents(items);
  return (
    <div className="fixed inset-0 bg-[#28190a]/45 backdrop-blur-[2px] z-40 flex justify-end" onClick={onClose}>
      <div
        className="bg-surface h-full w-full max-w-[420px] shadow-2xl flex flex-col"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between p-5 border-b border-border-soft">
          <h3 className="font-display font-bold text-heading text-[17px]">Seu carrinho</h3>
          <button
            aria-label="Fechar carrinho"
            onClick={onClose}
            className="w-9 h-9 rounded-full bg-chip flex items-center justify-center"
          >
            <X size={16} />
          </button>
        </div>
        <div className="flex-1 overflow-y-auto px-5">
          {items.length === 0 && (
            <p className="text-muted text-sm text-center py-10">Seu carrinho está vazio.</p>
          )}
          {items.map((item) => (
            <div key={item.key} className="flex gap-3 py-4 border-b border-border-soft">
              <div className="flex-1">
                <div className="font-semibold text-foreground text-[13.5px]">{item.name}</div>
                <div className="text-accent font-bold text-[13px] mt-1">
                  {formatMoney(item.unitPriceCents * item.quantity)}
                </div>
              </div>
              <div className="flex items-center gap-2.5 h-fit">
                <button
                  aria-label="Diminuir"
                  onClick={() => onDec(item.key)}
                  className="w-7 h-7 rounded-full bg-chip flex items-center justify-center"
                >
                  <Minus size={13} />
                </button>
                <span className="font-bold text-[13px] min-w-[14px] text-center">{item.quantity}</span>
                <button
                  aria-label="Aumentar"
                  onClick={() => onInc(item.key)}
                  className="w-7 h-7 rounded-full bg-chip flex items-center justify-center"
                >
                  <Plus size={13} />
                </button>
              </div>
            </div>
          ))}
        </div>
        <div className="p-5 border-t border-border-soft">
          <div className="flex justify-between mb-3.5">
            <span className="text-muted text-[13.5px]">Total</span>
            <span className="font-extrabold text-lg text-heading">{formatMoney(total)}</span>
          </div>
          <button
            disabled={items.length === 0}
            onClick={onCheckout}
            className="w-full bg-accent text-accent-ink font-bold py-3.5 rounded-lg disabled:opacity-40 hover:brightness-95 transition"
          >
            Finalizar pedido
          </button>
        </div>
      </div>
    </div>
  );
}

function CheckoutDrawer({
  items,
  settings,
  onClose,
  onBack,
  onSubmitted,
}: {
  items: CartItem[];
  settings: StoreSettings;
  onClose: () => void;
  onBack: () => void;
  onSubmitted: (orderId: string, whatsappUrl: string) => void;
}) {
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [deliveryType, setDeliveryType] = useState<DeliveryType>("delivery");
  const [address, setAddress] = useState("");
  const [payment, setPayment] = useState<PaymentMethod>("pix");
  const [notes, setNotes] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const subtotal = cartTotalCents(items);
  const deliveryFee = deliveryType === "delivery" ? settings.delivery_fee_cents : 0;
  const total = subtotal + deliveryFee;

  async function handleSubmit() {
    setError(null);
    if (!name.trim() || !phone.trim()) {
      setError("Preencha nome e telefone.");
      return;
    }
    if (deliveryType === "delivery" && !address.trim()) {
      setError("Informe o endereço de entrega.");
      return;
    }
    setSubmitting(true);
    try {
      const { id } = await createOrder({
        customerName: name,
        customerPhone: phone,
        deliveryType,
        address,
        paymentMethod: payment,
        notes,
        items,
        subtotalCents: subtotal,
        deliveryFeeCents: deliveryFee,
      });

      const paymentLabel = { pix: "Pix", dinheiro: "Dinheiro", cartao: "Cartão" }[payment];
      const lines = [
        `Olá! Novo pedido *#${id.slice(0, 8)}* — ${name}`,
        "",
        "Itens:",
        ...items.map((i) => {
          const opts = Object.entries(i.selectedOptions)
            .map(([g, v]) => `${g}: ${v.join(", ")}`)
            .join("; ");
          return `• ${i.quantity}x ${i.name}${opts ? ` (${opts})` : ""} — ${formatMoney(
            i.unitPriceCents * i.quantity
          )}`;
        }),
        "",
        `Subtotal: ${formatMoney(subtotal)}`,
        ...(deliveryFee ? [`Taxa de entrega: ${formatMoney(deliveryFee)}`] : []),
        `Total: ${formatMoney(total)}`,
        "",
        deliveryType === "delivery" ? `Entrega em: ${address}` : "Retirada no local",
        `Pagamento: ${paymentLabel}`,
        ...(notes.trim() ? [`Obs: ${notes.trim()}`] : []),
      ];
      const whatsappUrl = `https://wa.me/${settings.whatsapp_phone}?text=${encodeURIComponent(
        lines.join("\n")
      )}`;

      onSubmitted(id, whatsappUrl);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Erro ao enviar pedido.");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="fixed inset-0 bg-[#28190a]/45 backdrop-blur-[2px] z-40 flex justify-end" onClick={onBack}>
      <div
        className="bg-surface h-full w-full max-w-[420px] shadow-2xl flex flex-col"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between p-5 border-b border-border-soft">
          <h3 className="font-display font-bold text-heading text-[17px]">Finalizar pedido</h3>
          <button
            aria-label="Voltar"
            onClick={onBack}
            className="w-9 h-9 rounded-full bg-chip flex items-center justify-center"
          >
            <X size={16} />
          </button>
        </div>
        <div className="flex-1 overflow-y-auto p-5 flex flex-col gap-3.5">
          <label className="text-[12.5px] font-bold text-muted uppercase">
            Nome
            <input
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Seu nome"
              className="w-full mt-1.5 bg-surface border border-border rounded-lg px-3 py-2.5 text-sm text-foreground"
            />
          </label>
          <label className="text-[12.5px] font-bold text-muted uppercase">
            Telefone / WhatsApp
            <input
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              placeholder="(85) 9 9999-9999"
              className="w-full mt-1.5 bg-surface border border-border rounded-lg px-3 py-2.5 text-sm text-foreground"
            />
          </label>
          <div className="text-[13px] font-bold text-accent-dark uppercase mt-1">Entrega</div>
          <div className="flex gap-2.5">
            {(["delivery", "pickup"] as DeliveryType[]).map((t) => (
              <button
                key={t}
                onClick={() => setDeliveryType(t)}
                className={`flex-1 px-3.5 py-2 rounded-lg border-[1.5px] text-[13px] font-semibold ${
                  deliveryType === t
                    ? "border-accent bg-accent/10 text-accent-dark"
                    : "border-border text-foreground/80"
                }`}
              >
                {t === "delivery" ? "Entrega" : "Retirada"}
              </button>
            ))}
          </div>
          {deliveryType === "delivery" && (
            <label className="text-[12.5px] font-bold text-muted uppercase">
              Endereço
              <input
                value={address}
                onChange={(e) => setAddress(e.target.value)}
                placeholder="Rua, número, bairro"
                className="w-full mt-1.5 bg-surface border border-border rounded-lg px-3 py-2.5 text-sm text-foreground"
              />
            </label>
          )}
          <div className="text-[13px] font-bold text-accent-dark uppercase mt-1">Pagamento</div>
          <div className="flex gap-2.5 flex-wrap">
            {(["pix", "dinheiro", "cartao"] as PaymentMethod[]).map((p) => (
              <button
                key={p}
                onClick={() => setPayment(p)}
                className={`px-3.5 py-2 rounded-lg border-[1.5px] text-[13px] font-semibold capitalize ${
                  payment === p
                    ? "border-accent bg-accent/10 text-accent-dark"
                    : "border-border text-foreground/80"
                }`}
              >
                {p === "cartao" ? "Cartão" : p}
              </button>
            ))}
          </div>
          <label className="text-[12.5px] font-bold text-muted uppercase">
            Observações (opcional)
            <input
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Ex: sem cebola"
              className="w-full mt-1.5 bg-surface border border-border rounded-lg px-3 py-2.5 text-sm text-foreground"
            />
          </label>
          <div className="bg-chip border border-chip-border rounded-xl p-3.5 mt-1">
            <div className="flex justify-between text-muted text-[13px]">
              <span>Subtotal</span>
              <span>{formatMoney(subtotal)}</span>
            </div>
            <div className="flex justify-between text-muted text-[13px] mt-1.5">
              <span>Taxa de entrega</span>
              <span>{deliveryType === "delivery" ? formatMoney(deliveryFee) : "—"}</span>
            </div>
            <div className="flex justify-between font-extrabold text-heading text-base mt-2.5 pt-2.5 border-t border-chip-border">
              <span>Total</span>
              <span>{formatMoney(total)}</span>
            </div>
          </div>
          {error && <p className="text-[#B91C1C] text-sm">{error}</p>}
        </div>
        <div className="p-5 border-t border-border-soft">
          <button
            disabled={submitting}
            onClick={handleSubmit}
            className="w-full bg-[#1F9D55] text-white font-bold py-3.5 rounded-lg flex items-center justify-center gap-2 disabled:opacity-60"
          >
            <MessageCircle size={17} />
            {submitting ? "Enviando..." : "Enviar pedido via WhatsApp"}
          </button>
        </div>
      </div>
    </div>
  );
}

export function MenuPage({
  settings,
  categories,
}: {
  settings: StoreSettings;
  categories: CategoryWithProducts[];
}) {
  const { items, addItem, increment, decrement, clear } = useCartStore();
  const [showCart, setShowCart] = useState(false);
  const [showCheckout, setShowCheckout] = useState(false);
  const [builderProduct, setBuilderProduct] = useState<Product | null>(null);
  const [confirmed, setConfirmed] = useState<{ id: string; whatsappUrl: string } | null>(null);

  const visibleCategories = categories.filter((c) => c.products.length > 0 && c.slug !== "massas");
  const massasCategory = categories.find((c) => c.slug === "massas");
  const featured = categories.flatMap((c) => c.products).filter((p) => p.featured);

  function handleAdd(product: Product) {
    if (product.product_option_groups.length > 0) {
      setBuilderProduct(product);
      return;
    }
    addItem(product.id, product.name, product.price_cents);
  }

  function handleBuilderConfirm(name: string, priceCents: number, selected: Record<string, string[]>) {
    if (!builderProduct) return;
    addItem(builderProduct.id + JSON.stringify(selected), name, priceCents, selected);
    setBuilderProduct(null);
  }

  function handleSubmitted(id: string, whatsappUrl: string) {
    setShowCheckout(false);
    setConfirmed({ id, whatsappUrl });
    clear();
    window.open(whatsappUrl, "_blank");
  }

  const count = cartCount(items);
  const total = cartTotalCents(items);

  return (
    <div className="min-h-screen bg-background pb-28">
      {/* TOP BAR */}
      <div className="sticky top-0 z-30 bg-background/90 backdrop-blur-sm border-b border-border-soft">
        <div className="max-w-[1180px] mx-auto px-5 py-3 flex items-center justify-between gap-3.5">
          <div className="flex items-center gap-2.5 min-w-0 flex-1">
            <div className="w-[42px] h-[42px] rounded-xl overflow-hidden flex-shrink-0 border border-chip-border">
              {settings.logo_url ? (
                <Image src={settings.logo_url} alt={settings.name} width={42} height={42} className="object-cover w-full h-full" />
              ) : null}
            </div>
            <div className="min-w-0">
              <h1 className="font-display font-bold text-heading text-lg leading-tight truncate whitespace-nowrap">
                {settings.name.split(" ").slice(0, -2).join(" ")}{" "}
                <span className="text-accent">{settings.name.split(" ").slice(-2).join(" ")}</span>
              </h1>
              <div className="text-muted text-[11px] font-medium truncate whitespace-nowrap">
                {settings.tagline}
              </div>
            </div>
          </div>
          <div className="flex items-center gap-2.5 flex-shrink-0">
            <div
              className={`hidden sm:flex items-center gap-1.5 px-3 py-1.5 rounded-full ${
                settings.is_open ? "bg-[#1F9D55]/15" : "bg-[#D62828]/15"
              }`}
            >
              <span
                className={`w-[7px] h-[7px] rounded-full ${settings.is_open ? "bg-[#2FBE6F]" : "bg-[#FF5A5A]"}`}
              />
              <span className={`text-xs font-bold ${settings.is_open ? "text-[#15803D]" : "text-[#B91C1C]"}`}>
                {settings.is_open ? "Aberto agora" : "Fechado"}
              </span>
            </div>
            <div
              className={`sm:hidden w-7 h-7 rounded-full flex items-center justify-center ${
                settings.is_open ? "bg-[#1F9D55]/15" : "bg-[#D62828]/15"
              }`}
              aria-label={settings.is_open ? "Aberto agora" : "Fechado"}
            >
              <span
                className={`w-[7px] h-[7px] rounded-full ${settings.is_open ? "bg-[#2FBE6F]" : "bg-[#FF5A5A]"}`}
              />
            </div>
            <button
              aria-label="Ver carrinho"
              onClick={() => setShowCart(true)}
              className="relative w-10 h-10 rounded-full bg-chip border border-chip-border flex items-center justify-center"
            >
              <ShoppingCart size={18} />
              {count > 0 && (
                <span className="absolute -top-1 -right-1 bg-accent text-accent-ink text-[10px] font-extrabold min-w-[17px] h-[17px] rounded-full flex items-center justify-center px-1">
                  {count}
                </span>
              )}
            </button>
          </div>
        </div>
      </div>

      {/* HERO */}
      <div className="border-b border-border-soft">
        {settings.cover_url && (
          <div className="relative w-full h-44 sm:h-64 overflow-hidden bg-chip">
            <Image
              src={settings.cover_url}
              alt={settings.name}
              fill
              priority
              sizes="100vw"
              className="object-cover"
              style={{ objectPosition: "center 60%" }}
            />
          </div>
        )}
        <div className="max-w-[1180px] mx-auto px-5 py-7">
          <h2 className="font-display text-[34px] text-heading">Peça pelo cardápio digital</h2>
          <p className="text-foreground font-semibold text-[15px] mt-2 max-w-[520px]">
            Escolha seus espetinhos, monte seu macarrão do seu jeito e finalize o pedido direto pelo
            WhatsApp.
          </p>
          <div className="flex gap-2.5 flex-wrap mt-4">
            <span className="inline-flex items-center gap-1.5 bg-chip border border-chip-border text-[#5A3E28] font-semibold text-sm px-4 py-2 rounded-full">
              <Clock size={14} className="text-[#B45309]" /> {settings.opening_hours}
            </span>
            {settings.delivery_time_estimate && (
              <span className="inline-flex items-center gap-1.5 bg-chip border border-chip-border text-[#5A3E28] font-semibold text-sm px-4 py-2 rounded-full">
                <Bike size={14} className="text-[#B45309]" /> {settings.delivery_time_estimate} ·
                tempo de entrega
              </span>
            )}
            <span className="inline-flex items-center gap-1.5 bg-chip border border-chip-border text-[#5A3E28] font-semibold text-sm px-4 py-2 rounded-full">
              <MapPin size={14} className="text-[#B45309]" /> {settings.address}
            </span>
            <span className="inline-flex items-center gap-1.5 bg-chip border border-chip-border text-[#5A3E28] font-semibold text-sm px-4 py-2 rounded-full">
              <ShieldCheck size={14} className="text-[#B45309]" /> Ambiente familiar · Zero álcool
            </span>
            {settings.instagram_handle && (
              <a
                href={`https://instagram.com/${settings.instagram_handle}`}
                target="_blank"
                className="inline-flex items-center gap-1.5 bg-chip border border-chip-border text-[#5A3E28] font-semibold text-sm px-4 py-2 rounded-full hover:brightness-95 transition"
              >
                <svg
                  width="14"
                  height="14"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  className="text-[#B45309]"
                  aria-hidden="true"
                >
                  <rect x="2" y="2" width="20" height="20" rx="5" />
                  <circle cx="12" cy="12" r="4" />
                  <circle cx="17.5" cy="6.5" r="1" fill="currentColor" stroke="none" />
                </svg>
                @{settings.instagram_handle}
              </a>
            )}
          </div>
          {settings.welcome_message && (
            <div className="flex items-start gap-3 bg-surface border border-border rounded-xl p-4 mt-5 max-w-[640px]">
              <div className="w-8 h-8 rounded-full bg-chip flex items-center justify-center flex-shrink-0">
                <Megaphone size={15} className="text-accent-dark" />
              </div>
              <p className="text-foreground text-sm leading-relaxed">{settings.welcome_message}</p>
            </div>
          )}
        </div>
      </div>

      {/* CATEGORY NAV */}
      <div className="sticky top-[66px] z-20 bg-background border-b border-border-soft py-3 relative">
        <div className="max-w-[1180px] mx-auto relative">
          <div className="pointer-events-none absolute left-0 top-0 bottom-0 w-6 z-10 bg-gradient-to-r from-background to-transparent" />
          <div className="pointer-events-none absolute right-0 top-0 bottom-0 w-6 z-10 bg-gradient-to-l from-background to-transparent" />
          <div className="px-5 flex gap-2.5 overflow-x-auto [&::-webkit-scrollbar]:hidden">
            {featured.length > 0 && (
              <a href="#destaques" className="bg-[#FDE6D3] text-[#5A3E28] font-semibold text-sm px-4 py-2 rounded-full whitespace-nowrap">
                Destaques
              </a>
            )}
            {visibleCategories.map((c) => (
              <a
                key={c.id}
                href={`#${c.slug}`}
                className="bg-chip border border-chip-border text-[#5A3E28] font-semibold text-sm px-4 py-2 rounded-full whitespace-nowrap"
              >
                {c.name}
              </a>
            ))}
            {massasCategory && massasCategory.products.length > 0 && (
              <a href="#massas" className="bg-chip border border-chip-border text-[#5A3E28] font-semibold text-sm px-4 py-2 rounded-full whitespace-nowrap">
                Monte seu Macarrão
              </a>
            )}
          </div>
        </div>
      </div>

      <div className="max-w-[1180px] mx-auto px-5">
        {featured.length > 0 && (
          <section id="destaques" className="pt-7">
            <h3 className="font-display text-xl text-heading mb-3.5">Destaques da casa</h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {featured.map((p) => (
                <FeaturedCard key={p.id} product={p} onAdd={handleAdd} />
              ))}
            </div>
          </section>
        )}

        {visibleCategories.map((category) => (
          <section key={category.id} id={category.slug} className="pt-8">
            <h3 className="font-display text-xl text-heading mb-3.5">{category.name}</h3>
            <div className="bg-surface border border-border rounded-2xl shadow-sm">
              {category.products.map((p) => (
                <ProductRow key={p.id} product={p} onAdd={handleAdd} />
              ))}
            </div>
          </section>
        ))}

        {massasCategory && massasCategory.products.length > 0 && (
          <section id="massas" className="pt-8">
            <h3 className="font-display text-xl text-heading mb-3.5">Monte seu Macarrão</h3>
            {massasCategory.products.map((p) => (
              <div
                key={p.id}
                className="relative overflow-hidden border border-border rounded-2xl bg-cover bg-center"
                style={
                  settings.cover_url
                    ? { backgroundImage: `url(${settings.cover_url})`, backgroundPosition: "center 70%" }
                    : undefined
                }
              >
                <div
                  className="absolute inset-0"
                  style={{
                    background:
                      "linear-gradient(90deg, rgba(253,238,221,.97) 0%, rgba(253,238,221,.9) 45%, rgba(253,238,221,.5) 75%, rgba(253,238,221,.1) 100%)",
                  }}
                />
                <div className="relative z-10 p-5 flex flex-col sm:flex-row sm:items-center gap-4 sm:gap-5">
                  <div className="flex items-center gap-4">
                    <Thumb product={p} size={88} />
                    <div className="flex-1 min-w-0">
                      <div className="font-bold text-heading text-[17px]">{p.name}</div>
                      <div className="text-muted text-sm mt-1">{p.description}</div>
                    </div>
                  </div>
                  <button
                    onClick={() => setBuilderProduct(p)}
                    className="bg-accent text-accent-ink font-bold text-sm px-5 py-3 rounded-lg hover:brightness-95 transition whitespace-nowrap w-full sm:w-auto sm:flex-shrink-0"
                  >
                    Montar meu prato
                  </button>
                </div>
              </div>
            ))}
          </section>
        )}

        <footer className="mt-12 pt-7 pb-10 border-t border-border-soft flex justify-between flex-wrap gap-4">
          <div>
            <div className="font-display font-bold text-heading text-base">{settings.name}</div>
            <div className="text-muted text-xs mt-1.5 leading-relaxed">
              {settings.address}
              <br />
              Delivery: {settings.opening_hours}
            </div>
          </div>
          <a
            href={`https://wa.me/${settings.whatsapp_phone}`}
            target="_blank"
            className="flex items-center gap-2 bg-[#1F9D55] text-white px-4 py-2.5 rounded-lg font-bold text-sm h-fit"
          >
            <MessageCircle size={16} />
            Falar pelo WhatsApp
          </a>
        </footer>
      </div>

      {/* FLOATING CART BAR */}
      {count > 0 && !showCart && !showCheckout && !confirmed && (
        <div className="fixed left-0 right-0 bottom-4 flex justify-center z-20 px-4">
          <button
            onClick={() => setShowCart(true)}
            className="w-full max-w-[520px] bg-gradient-to-r from-accent to-[#D62828] rounded-2xl py-3.5 px-5 flex items-center justify-between shadow-lg"
          >
            <span className="text-accent-ink font-extrabold text-sm">
              {count} {count === 1 ? "item" : "itens"} no carrinho
            </span>
            <span className="text-accent-ink font-extrabold text-[15px]">
              {formatMoney(total)} · Ver carrinho
            </span>
          </button>
        </div>
      )}

      {builderProduct && (
        <BuilderModal
          product={builderProduct}
          onClose={() => setBuilderProduct(null)}
          onConfirm={handleBuilderConfirm}
        />
      )}

      {showCart && (
        <CartDrawer
          items={items}
          onClose={() => setShowCart(false)}
          onInc={increment}
          onDec={decrement}
          onCheckout={() => {
            setShowCart(false);
            setShowCheckout(true);
          }}
        />
      )}

      {showCheckout && (
        <CheckoutDrawer
          items={items}
          settings={settings}
          onClose={() => setShowCheckout(false)}
          onBack={() => {
            setShowCheckout(false);
            setShowCart(true);
          }}
          onSubmitted={handleSubmitted}
        />
      )}

      {confirmed && (
        <div className="fixed inset-0 bg-[#28190a]/45 backdrop-blur-[2px] z-40 flex items-center justify-center p-4">
          <div className="bg-surface rounded-[20px] border border-border max-w-md w-full p-10 text-center">
            <div className="w-16 h-16 rounded-full bg-[#1F9D55]/15 flex items-center justify-center mx-auto mb-4">
              <CheckCircle2 size={30} className="text-[#1F9D55]" />
            </div>
            <h3 className="font-display text-[19px] text-heading">Pedido enviado!</h3>
            <p className="text-muted text-sm mt-2">
              Recebemos seu pedido e abrimos o WhatsApp pra você confirmar com a gente. Obrigado pela
              preferência!
            </p>
            <a
              href={`/pedido/${confirmed.id}`}
              className="block mt-4 text-accent-dark font-semibold text-sm underline"
            >
              Acompanhar status do pedido
            </a>
            <button
              onClick={() => setConfirmed(null)}
              className="mt-5 bg-accent text-accent-ink font-bold px-6 py-3 rounded-lg hover:brightness-95 transition"
            >
              Fazer novo pedido
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
