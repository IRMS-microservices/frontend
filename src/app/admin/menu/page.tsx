"use client";

import Image from "next/image";
import { useEffect, useMemo, useState } from "react";
import { AdminSidebar } from "@/components/admin/AdminSidebar";
import { MenuService } from "@/services/menu.service";
import { DishCategory, DishResponse } from "@/types/menuOrder.types";
import {
  ChevronDown,
  Eye,
  Loader2,
  Plus,
  Search,
  Save,
  ShieldCheck,
  Trash2,
  X,
} from "lucide-react";

type IngredientRow = {
  id: string;
  name: string;
  amount: string;
  unit: string;
};

type MenuDraft = {
  id?: string;
  name: string;
  category: DishCategory;
  basePrice: string;
  imageUrl: string;
  available: boolean;
  yieldText: string;
  prepTime: string;
  cookTime: string;
  ingredients: IngredientRow[];
};

const CATEGORY_OPTIONS: Array<{ label: string; value: DishCategory | "ALL" }> =
  [
    { label: "All Items", value: "ALL" },
    { label: "Starters", value: DishCategory.APPETIZER },
    { label: "Mains", value: DishCategory.MAIN_COURSE },
    { label: "Desserts", value: DishCategory.DESSERT },
    { label: "Beverages", value: DishCategory.BEVERAGE },
    { label: "Sides", value: DishCategory.SIDE },
  ];

const INGREDIENT_OPTIONS = [
  "U10 Sea Scallops",
  "Unsalted Butter",
  "Microgreens",
  "Black Pepper",
  "Lemon Zest",
  "Smoked Paprika",
  "Aged Parmesan",
  "Jasmine Rice",
  "Fennel Pollen",
  "Roasted Garlic Confit",
  "Extra Virgin Olive Oil",
];

const UNIT_OPTIONS = ["PCS", "G", "KG", "ML", "L", "TBSP", "TSP"];

const makeId = () => Math.random().toString(36).slice(2, 10);

const defaultIngredients = (category: DishCategory): IngredientRow[] => {
  void category;
  return [];
};

const buildDraftFromDish = (dish: DishResponse): MenuDraft => ({
  id: dish._id,
  name: dish.name,
  category: dish.category,
  basePrice: String(dish.price),
  imageUrl: dish.image,
  available: dish.isAvailable,
  yieldText: "1 Portion",
  prepTime: "15m",
  cookTime: "5m",
  ingredients: defaultIngredients(dish.category),
});

const buildBlankDraft = (): MenuDraft => ({
  name: "",
  category: DishCategory.MAIN_COURSE,
  basePrice: "",
  imageUrl: "",
  available: true,
  yieldText: "1 Portion",
  prepTime: "15m",
  cookTime: "5m",
  ingredients: defaultIngredients(DishCategory.MAIN_COURSE),
});

const shortenUrl = (url: string, max = 42) => {
  if (!url) return "";
  if (url.length <= max) return url;
  const start = url.slice(0, 18);
  const end = url.slice(-14);
  return `${start}...${end}`;
};

const titleCase = (value: string) =>
  value
    .toLowerCase()
    .split("_")
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(" ");

export default function AdminMenuPage() {
  const [dishes, setDishes] = useState<DishResponse[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [category, setCategory] =
    useState<(typeof CATEGORY_OPTIONS)[number]["value"]>("ALL");
  const [selectedDishId, setSelectedDishId] = useState<string | null>(null);
  const [draft, setDraft] = useState<MenuDraft>(buildBlankDraft());
  const [isSaving, setIsSaving] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [feedback, setFeedback] = useState<string | null>(null);

  useEffect(() => {
    const load = async () => {
      setLoading(true);
      try {
        const dishRes = await MenuService.getDishes({ limit: 999_999_999 });
        const list = dishRes.success ? (dishRes.data ?? []) : [];
        setDishes(list);

        if (list[0]) {
          setSelectedDishId(list[0]._id);
          setDraft(buildDraftFromDish(list[0]));
        }
      } finally {
        setLoading(false);
      }
    };

    void load();
  }, []);

  const selectedDish = useMemo(
    () => dishes.find((dish) => dish._id === selectedDishId) ?? null,
    [dishes, selectedDishId],
  );

  useEffect(() => {
    if (selectedDish) {
      setDraft(buildDraftFromDish(selectedDish));
    }
  }, [selectedDishId, selectedDish]);

  const filteredDishes = useMemo(() => {
    const term = search.trim().toLowerCase();
    return dishes.filter((dish) => {
      const matchesSearch =
        !term ||
        [dish.name, titleCase(dish.category), String(dish.price)]
          .join(" ")
          .toLowerCase()
          .includes(term);
      const matchesCategory = category === "ALL" || dish.category === category;
      return matchesSearch && matchesCategory;
    });
  }, [category, dishes, search]);

  const saveChanges = async () => {
    setIsSaving(true);
    setFeedback(null);
    try {
      const payload = {
        name: draft.name,
        category: draft.category,
        price: Number(draft.basePrice), // also fix basePrice to price
        isAvailable: draft.available,
        image: draft.imageUrl, // also fix imageUrl to image
        yieldText: draft.yieldText,
        prepTime: draft.prepTime,
        cookTime: draft.cookTime,
        ingredients: draft.ingredients.map((ingredient) => ({
          id: ingredient.id,
          name: ingredient.name,
          amount: ingredient.amount,
          unit: ingredient.unit,
        })),
      };

      let saved: DishResponse | null = null;
      if (draft.id) {
        const response = await MenuService.updateDish(
          String(draft.id),
          payload,
        );
        saved = response.success ? (response.data ?? null) : null;
      } else {
        const response = await MenuService.createDish(payload);
        saved = response.success ? (response.data ?? null) : null;
      }

      if (!saved) {
        throw new Error("Failed to save dish.");
      }

      const refreshed = await MenuService.getDishes({ limit: 100 });
      if (refreshed.success && refreshed.data) {
        const next = refreshed.data ?? [];
        setDishes(next);
        const matched = next.find((dish) => dish._id === saved?._id);
        if (matched) {
          setSelectedDishId(matched._id);
        }
      }
      setFeedback("Changes saved.");
    } catch (error) {
      setFeedback(
        error instanceof Error ? error.message : "Failed to save dish.",
      );
    } finally {
      setIsSaving(false);
    }
  };

  const discardChanges = () => {
    if (selectedDish) {
      setDraft(buildDraftFromDish(selectedDish));
    } else {
      setDraft(buildBlankDraft());
    }
    setFeedback(null);
  };

  const deleteDish = async () => {
    if (!draft.id) {
      return;
    }

    setIsDeleting(true);
    setFeedback(null);
    try {
      const response = await MenuService.deleteDish(String(draft.id));
      if (!response.success) {
        throw new Error(response.message || "Failed to delete dish.");
      }

      const refreshed = await MenuService.getDishes({ limit: 100 });
      if (refreshed.success && refreshed.data) {
        const next = refreshed.data ?? [];
        setDishes(next);
        setSelectedDishId(next[0]?._id ?? null);
        setDraft(next[0] ? buildDraftFromDish(next[0]) : buildBlankDraft());
      }

      setFeedback("Dish deleted.");
    } catch (error) {
      setFeedback(
        error instanceof Error ? error.message : "Failed to delete dish.",
      );
    } finally {
      setIsDeleting(false);
    }
  };

  const updateIngredient = (
    id: string,
    key: keyof IngredientRow,
    value: string,
  ) => {
    setDraft((current) => ({
      ...current,
      ingredients: current.ingredients.map((ingredient) =>
        ingredient.id === id ? { ...ingredient, [key]: value } : ingredient,
      ),
    }));
  };

  return (
    <div className="h-screen flex overflow-hidden bg-[#F4F7F6]">
      <AdminSidebar />

      <main className="ml-60 flex-1 overflow-y-auto min-w-0">
        <div className="px-8 py-8">
          <div className="mb-8 flex flex-wrap items-start justify-between gap-4">
            <div>
              <p className="text-xs font-bold uppercase tracking-[0.35em] text-gray-500">
                Configuration
              </p>
              <h1 className="mt-3 text-3xl font-bold text-irms-text-primary">
                Menu Management
              </h1>
              <p className="mt-3 max-w-3xl text-sm leading-6 text-gray-600">
                Organize categories, update pricing, and manage recipe
                specifications.
              </p>
            </div>
          </div>

          <div className="grid gap-6 xl:grid-cols-[1fr_480px]">
            <section>
              <div className="mb-6 rounded-2xl bg-white px-5 py-4 shadow-sm ring-1 ring-black/5">
                <div className="flex items-center gap-3">
                  <Search className="h-5 w-5 text-gray-400" />
                  <input
                    value={search}
                    onChange={(event) => setSearch(event.target.value)}
                    placeholder="Search dishes, ingredients, or categories..."
                    className="w-full bg-transparent text-sm text-irms-text-primary outline-none placeholder:text-gray-400"
                  />
                </div>
              </div>

              <div className="mb-6 flex flex-wrap gap-3">
                {CATEGORY_OPTIONS.map((item) => {
                  const active = category === item.value;
                  return (
                    <button
                      key={item.value}
                      type="button"
                      onClick={() => setCategory(item.value)}
                      className={`rounded-full px-5 py-3 text-sm font-medium transition cursor-pointer ${
                        active
                          ? "bg-white text-irms-text-primary shadow-sm ring-1 ring-black/5"
                          : "bg-[#ECEFF1] text-gray-500 hover:bg-gray-200"
                      }`}
                    >
                      {item.label}
                    </button>
                  );
                })}
              </div>

              {loading ? (
                <div className="rounded-4xl bg-white p-10 text-center text-sm text-gray-500 shadow-sm ring-1 ring-black/5">
                  <Loader2 className="mx-auto mb-4 h-6 w-6 animate-spin text-irms-green" />
                  Loading dishes...
                </div>
              ) : filteredDishes.length === 0 ? (
                <div className="rounded-4xl border border-dashed border-gray-200 bg-white p-10 text-center shadow-sm ring-1 ring-black/5">
                  <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-[#EFF7F0] text-irms-green">
                    <Search className="h-6 w-6" />
                  </div>
                  <h3 className="mt-4 text-lg font-bold text-irms-text-primary">
                    No dishes found
                  </h3>
                  <p className="mx-auto mt-2 max-w-lg text-sm leading-6 text-gray-500">
                    There are no menu items available for this restaurant yet.
                  </p>
                </div>
              ) : (
                <div className="grid gap-5 lg:grid-cols-2">
                  {filteredDishes.map((dish) => {
                    const selected = selectedDishId === dish._id;
                    return (
                      <div
                        key={dish._id}
                        onClick={() => setSelectedDishId(dish._id)}
                        className={`overflow-hidden rounded-2xl border bg-white text-left shadow-sm cursor-pointer hover:scale-105 transition-all duration-150 ${
                          selected
                            ? "border-irms-green shadow-lg ring-4 ring-emerald-100"
                            : "border-gray-100 hover:border-gray-200 hover:shadow-md"
                        }`}
                      >
                        <div className="flex gap-4 p-4">
                          <div className="relative h-24 w-24 shrink-0 overflow-hidden rounded-xl bg-[#F4F7F6]">
                            {/* eslint-disable-next-line @next/next/no-img-element */}
                            <Image
                              src={dish.image || "/images/dish-placeholder.png"}
                              alt={dish.name}
                              fill
                              className="object-cover"
                            />
                          </div>

                          <div className="min-w-0 flex-1">
                            <div className="flex items-start justify-between gap-3">
                              <div className="inline-flex rounded-md bg-gray-100 px-2.5 py-1 text-[11px] font-bold uppercase tracking-[0.2em] text-gray-500">
                                {titleCase(dish.category)}
                              </div>

                              <button
                                type="button"
                                onClick={async (event) => {
                                  event.stopPropagation();
                                  const nextAvailable = !dish.isAvailable;
                                  const response = await MenuService.updateDish(
                                    String(dish._id),
                                    {
                                      isAvailable: nextAvailable,
                                    },
                                  );
                                  if (response.success) {
                                    setDishes((current) =>
                                      current.map((item) =>
                                        item._id === dish._id
                                          ? {
                                              ...item,
                                              isAvailable: nextAvailable,
                                            }
                                          : item,
                                      ),
                                    );
                                    if (selectedDishId === dish._id) {
                                      setDraft((current) => ({
                                        ...current,
                                        available: nextAvailable,
                                      }));
                                    }
                                  }
                                }}
                                className={`relative inline-flex h-7 w-12 items-center rounded-full transition ${
                                  dish.isAvailable
                                    ? "bg-orange-500"
                                    : "bg-gray-300"
                                }`}
                                aria-pressed={dish.isAvailable}
                              >
                                <span
                                  className={`inline-block h-5 w-5 transform rounded-full bg-white shadow transition ${
                                    dish.isAvailable
                                      ? "translate-x-6"
                                      : "translate-x-1"
                                  }`}
                                />
                              </button>
                            </div>

                            <h3 className="mt-2 line-clamp-2 text-lg font-bold leading-6 text-irms-text-primary">
                              {dish.name}
                            </h3>
                            <div className="mt-3 text-lg font-bold text-irms-green">
                              {dish.price.toLocaleString("vi-VN", {
                                style: "currency",
                                currency: "VND",
                              })}
                            </div>
                          </div>
                        </div>

                        <div className="border-t border-gray-100 px-4 py-3 text-right">
                          <div className="inline-flex items-center gap-2 text-xs font-bold uppercase tracking-[0.2em] text-gray-500">
                            <Eye className="h-4 w-4" />
                            View recipe
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </section>

            <aside className="absolute top-5 bottom-10 right-4 left-auto max-w-120">
              <div className="flex max-h-[calc(100vh-3rem)] flex-col overflow-hidden rounded-4xl bg-white shadow-2xl ring-1 ring-black/5">
                <div className="flex items-start justify-between gap-3 border-b border-gray-100 px-6 py-5">
                  <div>
                    <div className="inline-flex rounded-full bg-gray-100 px-3 py-1 text-xs font-bold uppercase tracking-[0.2em] text-gray-500">
                      Recipe Spec
                    </div>
                    <h2 className="mt-4 text-2xl font-bold text-irms-text-primary">
                      {draft.name || "New Dish"}
                    </h2>
                  </div>

                  <button
                    type="button"
                    onClick={() => {
                      setSelectedDishId(null);
                      setDraft(buildBlankDraft());
                    }}
                    className="rounded-full p-2 text-gray-400 transition hover:bg-gray-100 hover:text-gray-700"
                  >
                    <X className="h-5 w-5" />
                  </button>
                </div>

                <div className="flex-1 overflow-y-auto px-6 py-5">
                  <div className="grid gap-5">
                    <label className="grid gap-2">
                      <div className="text-sm font-medium text-gray-700">
                        Dish Name
                      </div>
                      <input
                        value={draft.name}
                        onChange={(event) =>
                          setDraft((current) => ({
                            ...current,
                            name: event.target.value,
                          }))
                        }
                        className="rounded-2xl border border-gray-200 px-4 py-3 text-sm outline-none transition focus:border-irms-green focus:ring-2 focus:ring-irms-green/15"
                        placeholder="Pan-Seared Scallops"
                      />
                    </label>

                    <div className="grid gap-4 sm:grid-cols-2">
                      <label className="grid gap-2">
                        <div className="text-sm font-medium text-gray-700">
                          Category
                        </div>
                        <div className="relative">
                          <select
                            value={draft.category}
                            onChange={(event) =>
                              setDraft((current) => ({
                                ...current,
                                category: event.target.value as DishCategory,
                                ingredients: defaultIngredients(
                                  event.target.value as DishCategory,
                                ),
                              }))
                            }
                            className="w-full appearance-none rounded-2xl border border-gray-200 bg-white px-4 py-3 pr-10 text-sm outline-none transition focus:border-irms-green focus:ring-2 focus:ring-irms-green/15"
                          >
                            {Object.values(DishCategory).map((value) => (
                              <option key={value} value={value}>
                                {titleCase(value)}
                              </option>
                            ))}
                          </select>
                          <ChevronDown className="pointer-events-none absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
                        </div>
                      </label>

                      <label className="grid gap-2">
                        <div className="text-sm font-medium text-gray-700">
                          Price
                        </div>
                        <input
                          value={draft.basePrice}
                          onChange={(event) =>
                            setDraft((current) => ({
                              ...current,
                              basePrice: event.target.value,
                            }))
                          }
                          className="rounded-2xl border max-w-52 border-gray-200 px-4 py-3 text-sm outline-none transition focus:border-irms-green focus:ring-2 focus:ring-irms-green/15"
                          placeholder="28.00"
                        />
                      </label>
                    </div>

                    <label className="grid gap-2">
                      <div className="text-sm font-medium text-gray-700">
                        Image URL
                      </div>
                      <input
                        value={draft.imageUrl}
                        onChange={(event) =>
                          setDraft((current) => ({
                            ...current,
                            imageUrl: event.target.value,
                          }))
                        }
                        className="rounded-2xl border border-gray-200 px-4 py-3 text-sm outline-none transition focus:border-irms-green focus:ring-2 focus:ring-irms-green/15"
                        placeholder="https://..."
                      />
                      <div className="rounded-2xl bg-gray-50 px-4 py-3 text-sm text-gray-500 ring-1 ring-black/5">
                        {shortenUrl(draft.imageUrl) || "Image URL preview"}
                      </div>
                    </label>

                    <div className="flex items-center justify-between rounded-2xl bg-[#F8FAFB] px-4 py-4 ring-1 ring-black/5">
                      <div>
                        <div className="text-sm font-medium text-gray-700">
                          Availability
                        </div>
                        <div className="mt-1 text-xs text-gray-500">
                          Orange toggle indicates active menu item.
                        </div>
                      </div>
                      <button
                        type="button"
                        onClick={() =>
                          setDraft((current) => ({
                            ...current,
                            available: !current.available,
                          }))
                        }
                        className={`relative inline-flex h-8 w-14 items-center rounded-full transition ${
                          draft.available ? "bg-orange-500" : "bg-gray-300"
                        }`}
                        aria-pressed={draft.available}
                      >
                        <span
                          className={`inline-block h-6 w-6 transform rounded-full bg-white shadow transition ${
                            draft.available ? "translate-x-7" : "translate-x-1"
                          }`}
                        />
                      </button>
                    </div>

                    <div>
                      <div className="mb-3 flex items-center justify-between">
                        <h3 className="text-sm font-bold uppercase tracking-[0.2em] text-gray-500">
                          Ingredients
                        </h3>
                        <button
                          type="button"
                          onClick={() =>
                            setDraft((current) => ({
                              ...current,
                              ingredients: [
                                ...current.ingredients,
                                {
                                  id: makeId(),
                                  name: INGREDIENT_OPTIONS[0],
                                  amount: "1",
                                  unit: UNIT_OPTIONS[0],
                                },
                              ],
                            }))
                          }
                          className="text-sm font-bold text-irms-green transition hover:text-irms-green-light"
                        >
                          + Add
                        </button>
                      </div>

                      <div className="grid grid-cols-[1.6fr_0.6fr_0.6fr_auto] gap-3 text-[11px] font-bold uppercase tracking-[0.2em] text-gray-400">
                        <div>Item</div>
                        <div>Amt</div>
                        <div>Unit</div>
                        <div />
                      </div>

                      <div className="mt-3 max-h-72 space-y-3 overflow-y-auto pr-1">
                        {draft.ingredients.map((ingredient) => (
                          <div
                            key={ingredient.id}
                            className="grid grid-cols-[1.6fr_0.6fr_0.6fr_auto] gap-3 rounded-2xl bg-[#FAFBFC] px-3 py-3 ring-1 ring-black/5"
                          >
                            <div className="relative min-w-0">
                              <select
                                value={ingredient.name}
                                onChange={(event) =>
                                  updateIngredient(
                                    ingredient.id,
                                    "name",
                                    event.target.value,
                                  )
                                }
                                className="w-full appearance-none overflow-hidden text-ellipsis whitespace-nowrap rounded-xl border border-gray-200 bg-white px-3 py-2 pr-8 text-sm outline-none transition focus:border-irms-green focus:ring-2 focus:ring-irms-green/15"
                                title={ingredient.name}
                              >
                                {INGREDIENT_OPTIONS.map((option) => (
                                  <option key={option} value={option}>
                                    {option}
                                  </option>
                                ))}
                              </select>
                              <ChevronDown className="pointer-events-none absolute right-2 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
                            </div>

                            <input
                              value={ingredient.amount}
                              onChange={(event) =>
                                updateIngredient(
                                  ingredient.id,
                                  "amount",
                                  event.target.value,
                                )
                              }
                              className="rounded-xl border border-gray-200 bg-white px-3 py-2 text-sm outline-none transition focus:border-irms-green focus:ring-2 focus:ring-irms-green/15"
                            />

                            <div className="relative">
                              <select
                                value={ingredient.unit}
                                onChange={(event) =>
                                  updateIngredient(
                                    ingredient.id,
                                    "unit",
                                    event.target.value,
                                  )
                                }
                                className="w-full appearance-none rounded-xl border border-gray-200 bg-white px-3 py-2 pr-8 text-sm outline-none transition focus:border-irms-green focus:ring-2 focus:ring-irms-green/15"
                              >
                                {UNIT_OPTIONS.map((option) => (
                                  <option key={option} value={option}>
                                    {option}
                                  </option>
                                ))}
                              </select>
                              <ChevronDown className="pointer-events-none absolute right-2 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
                            </div>

                            <button
                              type="button"
                              onClick={() =>
                                setDraft((current) => ({
                                  ...current,
                                  ingredients: current.ingredients.filter(
                                    (row) => row.id !== ingredient.id,
                                  ),
                                }))
                              }
                              className="rounded-xl px-2 text-gray-400 transition hover:bg-red-50 hover:text-red-500"
                            >
                              <Trash2 className="h-4 w-4" />
                            </button>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>

                <div className="sticky bottom-0 border-t border-gray-100 bg-white px-6 py-5">
                  <div className="flex items-center justify-end gap-3 ">
                    <div className="flex gap-3">
                      {draft.id && (
                        <button
                          type="button"
                          onClick={deleteDish}
                          disabled={isDeleting}
                          className="inline-flex items-center gap-2 rounded-2xl bg-red-50 px-5 py-3 text-sm font-bold text-red-700 transition hover:bg-red-100 disabled:cursor-not-allowed disabled:opacity-50"
                        >
                          {isDeleting ? (
                            <Loader2 className="h-4 w-4 animate-spin" />
                          ) : (
                            <Trash2 className="h-4 w-4" />
                          )}
                          Delete
                        </button>
                      )}
                      <button
                        type="button"
                        onClick={discardChanges}
                        className="rounded-2xl bg-gray-100 px-5 py-3 text-sm font-bold text-gray-700 transition hover:bg-gray-200"
                      >
                        Discard
                      </button>
                      <button
                        type="button"
                        onClick={saveChanges}
                        disabled={isSaving}
                        className="inline-flex items-center gap-2 rounded-2xl bg-irms-green px-5 py-3 text-sm font-bold text-white transition hover:bg-irms-green-light disabled:cursor-not-allowed disabled:opacity-50"
                      >
                        {isSaving ? (
                          <Loader2 className="h-4 w-4 animate-spin" />
                        ) : (
                          <Save className="h-4 w-4" />
                        )}
                        Save Changes
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </aside>
          </div>
        </div>
      </main>
    </div>
  );
}
