"use client";

import { Topbar } from "@/components/shared/Topbar";
import Link from "next/link";
import { useState } from "react";
import { useParams } from "next/navigation";
import { ShoppingCart, Flame } from "lucide-react";

type Category = "APPETIZERS" | "MAIN COURSE" | "DRINKS" | "DESSERTS";

interface MenuItem {
  id: number;
  name: string;
  description?: string;
  price: number;
  status: "IN STOCK" | "SOLD OUT";
  tag?: string;
  image: string;
}

interface CartItem {
  item: MenuItem;
  quantity: number;
}

const MENU: Record<Category, MenuItem[]> = {
  APPETIZERS: [
    {
      id: 1,
      name: "Wild Sea Scallops",
      description:
        "Pan-seared scallops, Périgord truffle, cauliflower silk, and bronze fennel oil.",
      price: 42,
      status: "IN STOCK",
      tag: "Chef's Special",
      image: "🦪",
    },
    {
      id: 2,
      name: "Heirloom Burrata",
      price: 24,
      status: "IN STOCK",
      image: "🧀",
    },
    {
      id: 3,
      name: "Ahi Tuna Tartare",
      price: 28,
      status: "SOLD OUT",
      image: "🐟",
    },
    {
      id: 4,
      name: "Wagyu Carpaccio",
      price: 32,
      status: "IN STOCK",
      image: "🥩",
    },
    {
      id: 5,
      name: "Lobster Bisque",
      price: 19,
      status: "IN STOCK",
      image: "🦞",
    },
  ],
  "MAIN COURSE": [
    {
      id: 6,
      name: "Dry Aged Ribeye",
      price: 88,
      status: "IN STOCK",
      image: "🥩",
    },
    {
      id: 7,
      name: "Sea Bass en Papillote",
      price: 56,
      status: "IN STOCK",
      image: "🐟",
    },
    {
      id: 8,
      name: "Truffle Risotto",
      price: 44,
      status: "IN STOCK",
      image: "🍚",
    },
  ],
  DRINKS: [
    {
      id: 9,
      name: "Cabernet Sauvignon",
      price: 185,
      status: "IN STOCK",
      tag: "Bottle Service",
      image: "🍷",
    },
    {
      id: 10,
      name: "House Sparkling",
      price: 18,
      status: "IN STOCK",
      image: "🥂",
    },
  ],
  DESSERTS: [
    {
      id: 11,
      name: "Valrhona Soufflé",
      price: 22,
      status: "IN STOCK",
      image: "🍫",
    },
    {
      id: 12,
      name: "Seasonal Sorbet",
      price: 16,
      status: "IN STOCK",
      image: "🍧",
    },
  ],
};

const STATUS_COLORS = {
  "IN STOCK": "bg-green-100 text-green-700",
  "SOLD OUT": "bg-red-500 text-white",
};

export default function OrderPage() {
  const params = useParams();
  const tableId = params.id as string;
  const [category, setCategory] = useState<Category>("APPETIZERS");
  const [cart, setCart] = useState<CartItem[]>([
    { item: MENU.APPETIZERS[0], quantity: 1 },
    { item: MENU.APPETIZERS[1], quantity: 1 },
  ]);
  const [notes, setNotes] = useState("");

  const addToCart = (item: MenuItem) => {
    setCart((prev) => {
      const existing = prev.find((c) => c.item.id === item.id);
      if (existing)
        return prev.map((c) =>
          c.item.id === item.id ? { ...c, quantity: c.quantity + 1 } : c,
        );
      return [...prev, { item, quantity: 1 }];
    });
  };

  const removeFromCart = (itemId: number) => {
    setCart((prev) => prev.filter((c) => c.item.id !== itemId));
  };

  const decreaseFromCart = (item: MenuItem) => {
    setCart((prev) => {
      const existing = prev.find((c) => c.item.id === item.id);
      if (!existing) return prev;
      if (existing.quantity === 1)
        return prev.filter((c) => c.item.id !== item.id);
      return prev.map((c) =>
        c.item.id === item.id ? { ...c, quantity: c.quantity - 1 } : c,
      );
    });
  };

  const subtotal = cart.reduce((sum, c) => sum + c.item.price * c.quantity, 0);

  return (
    <div className="flex flex-col h-full">
      {/* Top bar */}
      <Topbar title="Table & Order" />

      <div className="flex-1 flex overflow-hidden">
        {/* Menu section */}
        <div className="flex-1 p-8 overflow-y-auto">
          {/* Breadcrumb + Title */}
          <nav className="flex items-center gap-2 text-xs text-irms-text-muted font-semibold tracking-widest uppercase mb-2">
            <Link href="/server/tables" className="hover:text-irms-green">
              Table &amp; Order
            </Link>
            <span>›</span>
            <Link
              href={`/server/tables/${tableId}`}
              className="hover:text-irms-green"
            >
              Table {tableId} Detail
            </Link>
            <span>›</span>
            <span className="text-irms-text-primary">Order</span>
          </nav>
          <h2 className="text-3xl font-bold text-irms-text-primary mb-1">
            Table {tableId}
          </h2>
          <div className="flex items-center gap-4 text-sm text-irms-text-primary mb-5">
            <span className="flex items-center gap-1">
              <span className="w-1.5 h-1.5 rounded-full bg-irms-text-primary inline-block" />
              4 Guests
            </span>
            <span className="flex items-center gap-1">
              <span className="w-1.5 h-1.5 rounded-full bg-irms-text-primary inline-block" />
              Server: Julian
            </span>
          </div>

          {/* Category tabs */}
          <div className="flex items-center gap-2 mb-6">
            {(Object.keys(MENU) as Category[]).map((cat) => (
              <button
                key={cat}
                onClick={() => setCategory(cat)}
                className={`px-4 py-2 rounded-lg text-sm font-semibold transition-all cursor-pointer ${
                  category === cat
                    ? "bg-irms-green text-white"
                    : "bg-white border border-irms-border text-irms-text-primary hover:border-irms-green/40"
                }`}
              >
                {cat}
              </button>
            ))}
          </div>

          {/* Menu grid */}
          <div className="grid grid-cols-2 lg:grid-cols-3 gap-4">
            {MENU[category].map((item) => {
              const inCart = cart.find((c) => c.item.id === item.id);
              return (
                <div
                  key={item.id}
                  className="bg-white rounded-xl border border-irms-border overflow-hidden hover:shadow-md transition-shadow flex flex-col"
                >
                  {/* Image placeholder */}
                  <div className="h-32 bg-linear-to-br from-irms-bg-secondary to-irms-border flex items-center justify-center text-5xl shrink-0">
                    {item.image}
                  </div>

                  <div className="p-4 flex flex-col flex-1">
                    <div className="flex items-center gap-2 mb-1 flex-wrap">
                      <span
                        className={`text-xs font-bold px-2 py-0.5 rounded ${STATUS_COLORS[item.status]}`}
                      >
                        {item.status}
                      </span>
                      {item.tag && (
                        <span className="text-xs text-irms-text-muted">
                          • {item.tag}
                        </span>
                      )}
                      {item.status === "IN STOCK" && (
                        <span className="ml-auto text-base font-bold text-irms-text-primary">
                          ${item.price}
                        </span>
                      )}
                    </div>

                    <h3
                      className={`font-bold text-irms-text-primary mb-1 ${item.description ? "" : "text-sm"}`}
                    >
                      {item.name}
                    </h3>
                    {item.description && (
                      <p className="text-xs text-irms-text-muted mb-3 line-clamp-2">
                        {item.description}
                      </p>
                    )}
                    {!item.description && item.status !== "SOLD OUT" && (
                      <p className="text-base font-bold text-irms-text-primary mb-2">
                        ${item.price}
                      </p>
                    )}

                    {/* Spacer pushes action to bottom */}
                    <div className="flex-1" />

                    {item.status === "SOLD OUT" ? (
                      <div className="py-1 text-xs text-irms-text-muted text-center">
                        Unavailable
                      </div>
                    ) : inCart ? (
                      <div className="flex items-center justify-between gap-2 mt-1">
                        <button
                          onClick={() => decreaseFromCart(item)}
                          className="w-9 h-9 rounded-lg border border-irms-border text-irms-text-primary flex items-center justify-center hover:bg-irms-bg-secondary transition-colors cursor-pointer text-lg font-bold leading-none"
                          aria-label="Decrease quantity"
                        >
                          −
                        </button>
                        <span className="text-sm font-bold text-irms-text-primary min-w-6 text-center">
                          {inCart.quantity}
                        </span>
                        <button
                          onClick={() => addToCart(item)}
                          className="w-9 h-9 rounded-lg bg-irms-green text-white flex items-center justify-center hover:bg-irms-green/80 transition-colors cursor-pointer"
                          aria-label="Increase quantity"
                        >
                          <svg
                            width="14"
                            height="14"
                            viewBox="0 0 24 24"
                            fill="none"
                            stroke="currentColor"
                            strokeWidth="3"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                          >
                            <line x1="12" y1="5" x2="12" y2="19" />
                            <line x1="5" y1="12" x2="19" y2="12" />
                          </svg>
                        </button>
                      </div>
                    ) : (
                      <button
                        onClick={() => addToCart(item)}
                        className="w-full py-3 rounded-lg flex items-center justify-center gap-2 bg-irms-orange hover:bg-irms-orange/80 text-white text-xs font-bold tracking-wider transition-colors cursor-pointer mt-1"
                      >
                        <ShoppingCart className="w-4 h-4" />
                        ADD TO CART
                      </button>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Cart */}
        <div className="w-[400px] shrink-0 bg-white border-l border-irms-border flex flex-col">
          {/* Cart header */}
          <div className="flex items-center justify-between px-6 py-4 border-b border-irms-border">
            <h2 className="text-lg font-bold text-irms-text-primary">
              Current Cart
            </h2>
            <span className="bg-irms-bg-secondary text-irms-text-primary text-xs font-bold px-2 py-1 rounded-full">
              {cart.length} ITEMS
            </span>
          </div>

          {/* Cart items */}
          <div className="flex-1 overflow-y-auto px-6 py-4 space-y-4">
            {cart.map((c) => (
              <div
                key={c.item.id}
                className="border-b border-irms-border pb-4 flex flex-col gap-2"
              >
                <div className="flex items-start justify-between mb-1">
                  <div className="flex items-center gap-2">
                    <span className="text-xl">{c.item.image}</span>
                    <div className="flex flex-col gap-2">
                      <p className="text-sm font-semibold text-irms-text-primary">
                        {c.item.name}
                      </p>
                      <div className="flex items-center gap-1 text-xs text-irms-text-secondary">
                        Quantity: {c.quantity}
                      </div>
                    </div>
                  </div>
                  <span className="text-sm font-bold text-irms-text-primary">
                    ${c.item.price * c.quantity}
                  </span>
                </div>
                <div className="flex gap-3 text-xs font-semibold ml-7">
                  <button
                    onClick={() => removeFromCart(c.item.id)}
                    className="text-red-500 hover:underline cursor-pointer ml-2"
                  >
                    REMOVE
                  </button>
                </div>
              </div>
            ))}
          </div>

          {/* Kitchen notes */}
          <div className="px-6 py-4">
            <p className="text-xs font-bold text-irms-text-primary tracking-widest uppercase mb-2">
              Kitchen Notes
            </p>
            <textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="e.g. Allergy: Shellfish, Dressing on the side..."
              rows={3}
              className="w-full bg-[#f9fafb] border border-irms-border rounded-lg p-3 text-sm text-irms-text-primary placeholder-irms-text-muted outline-none resize-none focus:border-irms-green transition-colors"
            />
          </div>

          {/* Subtotal + Fire */}
          <div className="px-6 pb-6 space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-irms-text-secondary tracking-widest uppercase">
                Subtotal
              </span>
              <span className="text-lg font-bold text-irms-text-primary">
                ${subtotal.toFixed(2)}
              </span>
            </div>
            <Link
              href={`/server/tables/${tableId}/payment`}
              className="flex items-center justify-center gap-2 w-full bg-linear-to-r from-irms-green to-irms-green/80 hover:from-irms-green/80 hover:to-irms-green py-3 px-4 rounded-xl transition-colors duration-500 text-sm text-white font-bold"
            >
              <Flame className="w-4 h-4" />
              CONFIRM &amp; FIRE TO KITCHEN
            </Link>
            <button className="w-full text-sm font-semibold text-irms-text-primary hover:text-irms-text-primary/80 py-2 transition-colors cursor-pointer">
              SAVE AS DRAFT
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
