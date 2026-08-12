"use client";

import { useEffect, useMemo, useState } from "react";
import { AdminSidebar } from "@/components/admin/AdminSidebar";
import { PinCodeInput } from "@/components/admin/payment/PinCodeInput";
import { PaymentGatewayCard } from "@/components/admin/payment/PaymentGatewayCard";
import { PaymentService } from "@/services/payment.service";
import { RestaurantService } from "@/services/restaurant.service";
import {
  PaymentCredentialEntryInput,
  PaymentCredentialsResponse,
  PaymentMethodResponse,
} from "@/types/payment.types";
import { RestaurantResponse } from "@/types/restaurant.types";
import {
  AlertCircle,
  ChevronRight,
  CreditCard,
  Loader2,
  LockKeyhole,
  Save,
  Settings2,
} from "lucide-react";

const pinStorageKey = (restaurantId: string) =>
  `irms_payment_pin_configured_${restaurantId}`;

export default function AdminPaymentSettingPage() {
  const [restaurantId, setRestaurantId] = useState<string | null>(null);
  const [restaurant, setRestaurant] = useState<RestaurantResponse | null>(null);
  const [methods, setMethods] = useState<PaymentMethodResponse[]>([]);
  const [credentials, setCredentials] = useState<PaymentCredentialsResponse[]>(
    [],
  );
  const [isLoading, setIsLoading] = useState(true);
  const [isSavingPin, setIsSavingPin] = useState(false);
  const [pinValue, setPinValue] = useState("");
  const [loadError, setLoadError] = useState<string | null>(null);
  const [pinError, setPinError] = useState<string | null>(null);
  const [pinConfigured, setPinConfigured] = useState(false);
  const [isGatewayModalOpen, setIsGatewayModalOpen] = useState(false);
  const [newGatewayMethodId, setNewGatewayMethodId] = useState("");
  const [newGatewayValues, setNewGatewayValues] = useState<
    Record<string, string>
  >({});
  const [isCreatingGateway, setIsCreatingGateway] = useState(false);
  const [gatewayError, setGatewayError] = useState<string | null>(null);

  useEffect(() => {
    const load = async () => {
      setIsLoading(true);
      setLoadError(null);

      try {
        const [methodsRes, credentialsRes] = await Promise.all([
          PaymentService.getPaymentMethods(),
          PaymentService.getPaymentCredentials(),
        ]);

        if (methodsRes.success && methodsRes.data) {
          setMethods(methodsRes.data);
        }

        if (credentialsRes.success && credentialsRes.data) {
          setCredentials(credentialsRes.data);
        }

        const derivedRestaurantId = credentialsRes.success
          ? credentialsRes.data?.[0]?.restaurantId ?? null
          : null;
        if (derivedRestaurantId) {
          setRestaurantId(derivedRestaurantId);

          const restaurantRes = await RestaurantService.getRestaurantById(
            derivedRestaurantId,
          );
          if (restaurantRes.success && restaurantRes.data) {
            setRestaurant(restaurantRes.data);
          }

          setPinConfigured(
            window.localStorage.getItem(pinStorageKey(derivedRestaurantId)) ===
              "true",
          );
        } else {
          setRestaurantId(null);
          setPinConfigured(false);
        }
      } catch (error) {
        setLoadError(
          error instanceof Error
            ? error.message
            : "Failed to load payment settings",
        );
      } finally {
        setIsLoading(false);
      }
    };

    void load();
  }, []);

  const methodById = useMemo(() => {
    return new Map(methods.map((method) => [method._id, method]));
  }, [methods]);

  const selectedGatewayMethod = useMemo(() => {
    if (!methods.length) {
      return undefined;
    }

    return methodById.get(newGatewayMethodId) ?? methods[0];
  }, [methodById, methods, newGatewayMethodId]);

  const gatewayCards = useMemo(() => {
    return credentials.map((credential) => ({
      credential,
      method: methodById.get(credential.paymentMethodId),
    }));
  }, [credentials, methodById]);

  useEffect(() => {
    if (!newGatewayMethodId && methods.length > 0) {
      setNewGatewayMethodId(methods[0]._id);
    }
  }, [methods, newGatewayMethodId]);

  const handleSavePin = async () => {
    if (!restaurantId) {
      return;
    }

    if (!/^\d{6}$/.test(pinValue)) {
      setPinError("Enter a valid 6-digit PIN.");
      return;
    }

    setIsSavingPin(true);
    setPinError(null);

    try {
      const response = await RestaurantService.updateRestaurant(
        restaurantId,
        {
          pin: pinValue,
        },
      );

      if (!response.success) {
        throw new Error(response.message || "Failed to configure PIN");
      }

      window.localStorage.setItem(
        pinStorageKey(restaurantId),
        "true",
      );
      setPinConfigured(true);
      setPinValue("");
    } catch (error) {
      setPinError(
        error instanceof Error ? error.message : "Failed to configure PIN",
      );
    } finally {
      setIsSavingPin(false);
    }
  };

  const resetGatewayModal = () => {
    setGatewayError(null);
    setNewGatewayValues({});
    if (methods[0]?._id) {
      setNewGatewayMethodId(methods[0]._id);
    }
  };

  const handleCreateGateway = async () => {
    if (!restaurantId || !selectedGatewayMethod) {
      return;
    }

    const requiredFields = selectedGatewayMethod.requiredFields ?? [];
    const missingField = requiredFields.find(
      (field) =>
        field.required !== false &&
        !String(newGatewayValues[field.key] ?? "").trim(),
    );
    if (missingField) {
      setGatewayError(
        `Please fill in ${missingField.label ?? missingField.key}.`,
      );
      return;
    }

    const credentialsPayload: PaymentCredentialEntryInput[] =
      requiredFields.map((field) => ({
        key: field.key,
        label: field.label ?? field.key,
        value: newGatewayValues[field.key] ?? "",
      }));

    setIsCreatingGateway(true);
    setGatewayError(null);

    try {
      const response = await PaymentService.createPaymentCredentials({
        paymentMethodId: selectedGatewayMethod._id,
        isActive: true,
        credentials: credentialsPayload,
      });

      if (!response.success) {
        throw new Error(response.message || "Failed to create gateway");
      }

      const refreshed = await PaymentService.getPaymentCredentials({
      });
      if (refreshed.success && refreshed.data) {
        setCredentials(refreshed.data);
      }

      setIsGatewayModalOpen(false);
      resetGatewayModal();
    } catch (error) {
      setGatewayError(
        error instanceof Error ? error.message : "Failed to create gateway",
      );
    } finally {
      setIsCreatingGateway(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#F4F7F6] flex">
      <AdminSidebar />

      <main className="flex-1 ml-60">
        <div className="mx-auto max-w-7xl px-8 py-8">
          <div className="mb-8 flex items-start justify-between gap-4">
            <div>
              <p className="text-xs font-bold uppercase tracking-[0.35em] text-gray-500">
                Configuration
              </p>
              <h1 className="mt-3 text-3xl font-bold text-irms-text-primary">
                Payment Settings
              </h1>
              <p className="mt-3 max-w-3xl text-sm leading-6 text-gray-600">
                Manage gateway credentials, control access with a restaurant
                PIN, and open each gateway only when needed.
              </p>
            </div>

            <div className="rounded-2xl bg-white px-4 py-3 shadow-sm ring-1 ring-black/5">
              <div className="flex items-center gap-3">
                <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-[#EFF7F0] text-irms-green">
                  <Settings2 className="h-5 w-5" />
                </div>
                <div>
                  <div className="text-[11px] font-bold uppercase tracking-[0.3em] text-gray-400">
                    Restaurant
                  </div>
                  <div className="text-sm font-bold text-irms-text-primary">
                    {restaurant?.name ??
                      restaurant?.name ??
                      "Current Workspace"}
                  </div>
                </div>
              </div>
            </div>
          </div>

          {loadError && (
            <div className="mb-6 rounded-2xl border border-red-100 bg-red-50 px-4 py-3 text-sm text-red-700">
              {loadError}
            </div>
          )}

          {!pinConfigured && (
            <section className="rounded-4xl bg-white p-7 shadow-sm ring-1 ring-black/5">
              <div className="mb-8 flex flex-wrap items-start justify-between gap-4">
                <div className="flex items-start gap-4">
                  <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-[#E8F4EF] text-irms-green">
                    <LockKeyhole className="h-6 w-6" />
                  </div>
                  <div>
                    <h2 className="text-xl font-bold text-irms-text-primary">
                      Security PIN Authorization
                    </h2>
                    <p className="mt-2 max-w-3xl text-sm leading-6 text-gray-600">
                      Establish a secure 6-digit PIN required for authorizing
                      gateway access and viewing sensitive credential values.
                    </p>
                  </div>
                </div>

                <div className="rounded-full bg-amber-50 px-4 py-2 text-xs font-bold uppercase tracking-[0.25em] text-amber-700 ring-1 ring-amber-100">
                  PIN not configured
                </div>
              </div>

              <div className="grid gap-8 lg:grid-cols-[1fr_auto] lg:items-center">
                <div>
                  <div className="mb-3 text-sm font-bold uppercase tracking-[0.18em] text-gray-800">
                    Enter new 6-digit PIN
                  </div>
                  <PinCodeInput value={pinValue} onChange={setPinValue} />
                  <div className="mt-3 flex items-center gap-2 text-sm text-gray-500">
                    <AlertCircle className="h-4 w-4" />
                    PIN must be memorable but not sequential or repeating.
                  </div>
                  {pinError && (
                    <p className="mt-3 text-sm font-medium text-red-600">
                      {pinError}
                    </p>
                  )}
                </div>

                <button
                  type="button"
                  onClick={handleSavePin}
                  disabled={isSavingPin || pinValue.length !== 6}
                  className="inline-flex items-center justify-center gap-3 rounded-2xl bg-irms-green px-6 py-4 text-sm font-bold uppercase tracking-[0.15em] text-white shadow-lg shadow-irms-green/20 transition hover:bg-irms-green-light disabled:cursor-not-allowed disabled:opacity-50"
                >
                  {isSavingPin ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    <Save className="h-4 w-4" />
                  )}
                  Save Configuration
                </button>
              </div>
            </section>
          )}

          <section className="mt-10">
            <div className="mb-6 flex flex-wrap items-end justify-between gap-4">
              <div>
                <h2 className="text-2xl font-bold text-irms-text-primary">
                  Active Payment Gateways
                </h2>
                <p className="mt-2 max-w-3xl text-sm leading-6 text-gray-600">
                  Manage integrated payment processors and view their masked
                  credential sets before unlocking the detail screen.
                </p>
              </div>

              <button
                type="button"
                onClick={() => {
                  setGatewayError(null);
                  setIsGatewayModalOpen(true);
                }}
                className="inline-flex items-center gap-2 rounded-2xl bg-[#E9ECEF] px-5 py-4 text-sm font-bold uppercase tracking-[0.15em] text-gray-700 transition hover:bg-gray-200"
              >
                <CreditCard className="h-4 w-4" />
                Configure New Gateway
              </button>
            </div>

            {isLoading ? (
              <div className="rounded-4xl bg-white p-10 text-center text-sm text-gray-500 shadow-sm ring-1 ring-black/5">
                <Loader2 className="mx-auto mb-4 h-6 w-6 animate-spin text-irms-green" />
                Loading payment gateways...
              </div>
            ) : gatewayCards.length === 0 ? (
              <div className="rounded-4xl bg-white p-10 text-center shadow-sm ring-1 ring-black/5">
                <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-[#EFF7F0] text-irms-green">
                  <CreditCard className="h-6 w-6" />
                </div>
                <h3 className="mt-4 text-lg font-bold text-irms-text-primary">
                  No payment gateways yet
                </h3>
                <p className="mx-auto mt-2 max-w-lg text-sm leading-6 text-gray-500">
                  Add credentials for a payment method to start managing gateway
                  status and credential access.
                </p>
              </div>
            ) : (
              <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-3">
                {gatewayCards.map(({ credential, method }) => (
                  <PaymentGatewayCard
                    key={credential._id}
                    method={method}
                    credentials={credential}
                    href={`/admin/payment-setting/${credential._id}`}
                  />
                ))}
              </div>
            )}

            <div className="mt-10 rounded-4xl border border-dashed border-gray-200 bg-white/60 p-6 text-sm text-gray-500">
              <div className="flex items-center gap-3 font-bold text-gray-700">
                <ChevronRight className="h-4 w-4 text-irms-green" />
                Access control model
              </div>
              <p className="mt-3 max-w-4xl leading-6">
                Admin users can browse masked payment credentials from this
                page. Opening a gateway detail screen requires PIN verification
                and a short-lived access token, which is revoked when the detail
                view closes or expires.
              </p>
            </div>
          </section>

          {isGatewayModalOpen && selectedGatewayMethod && (
            <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/50 px-4 backdrop-blur-md">
              <div className="w-full max-w-3xl rounded-4xl bg-white p-7 shadow-2xl shadow-slate-950/20">
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <p className="text-xs font-bold uppercase tracking-[0.3em] text-gray-400">
                      Gateway Setup
                    </p>
                    <h3 className="mt-2 text-2xl font-bold text-irms-text-primary">
                      Configure new gateway
                    </h3>
                    <p className="mt-2 text-sm leading-6 text-gray-600">
                      Choose a payment method and provide its required
                      credential fields.
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={() => {
                      setIsGatewayModalOpen(false);
                      resetGatewayModal();
                    }}
                    className="rounded-full bg-gray-100 px-4 py-2 text-sm font-bold text-gray-600 transition hover:bg-gray-200"
                  >
                    Close
                  </button>
                </div>

                <div className="mt-6 grid gap-6 lg:grid-cols-[280px_1fr]">
                  <div className="rounded-3xl bg-[#F7FAF9] p-5 ring-1 ring-black/5">
                    <div className="text-xs font-bold uppercase tracking-[0.25em] text-gray-400">
                      Payment method
                    </div>
                    <select
                      value={newGatewayMethodId}
                      onChange={(event) => {
                        setNewGatewayMethodId(event.target.value);
                        setNewGatewayValues({});
                      }}
                      className="mt-3 w-full rounded-2xl border border-gray-200 bg-white px-4 py-3 text-sm font-semibold text-gray-700 outline-none focus:border-irms-green focus:ring-2 focus:ring-irms-green/15"
                    >
                      {methods.map((method) => (
                        <option key={method._id} value={method._id}>
                          {method.name}
                        </option>
                      ))}
                    </select>

                    <div className="mt-5 rounded-2xl bg-white p-4 ring-1 ring-black/5">
                      <div className="text-[11px] font-bold uppercase tracking-[0.25em] text-gray-400">
                        Preview
                      </div>
                      <div className="mt-2 text-base font-bold text-irms-text-primary">
                        {selectedGatewayMethod.name}
                      </div>
                      <div className="mt-1 text-sm text-gray-500">
                        {selectedGatewayMethod.code}
                      </div>
                      <div className="mt-4 text-xs leading-6 text-gray-500">
                        Required fields are rendered from the selected payment
                        method metadata.
                      </div>
                    </div>
                  </div>

                  <div className="rounded-3xl border border-gray-100 bg-white p-5">
                    <div className="grid gap-5">
                      {(selectedGatewayMethod.requiredFields ?? []).length ===
                      0 ? (
                        <div className="rounded-2xl bg-gray-50 p-4 text-sm text-gray-500">
                          This payment method has no required fields.
                        </div>
                      ) : (
                        (selectedGatewayMethod.requiredFields ?? []).map(
                          (field) => (
                            <label key={field.key} className="grid gap-2">
                              <div className="flex items-center justify-between text-sm font-bold text-gray-700">
                                <span>{field.label ?? field.key}</span>
                                {field.required !== false && (
                                  <span className="text-[11px] uppercase tracking-[0.2em] text-rose-500">
                                    Required
                                  </span>
                                )}
                              </div>
                              <input
                                type={
                                  field.type === "password"
                                    ? "password"
                                    : "text"
                                }
                                value={newGatewayValues[field.key] ?? ""}
                                onChange={(event) =>
                                  setNewGatewayValues((current) => ({
                                    ...current,
                                    [field.key]: event.target.value,
                                  }))
                                }
                                placeholder={field.label ?? field.key}
                                className="rounded-2xl border border-gray-200 bg-[#F9FAFB] px-4 py-3 text-sm text-gray-800 outline-none transition focus:border-irms-green focus:ring-2 focus:ring-irms-green/15"
                              />
                            </label>
                          ),
                        )
                      )}
                    </div>

                    {gatewayError && (
                      <p className="mt-4 text-sm font-medium text-red-600">
                        {gatewayError}
                      </p>
                    )}

                    <div className="mt-6 flex justify-end gap-3">
                      <button
                        type="button"
                        onClick={() => {
                          setIsGatewayModalOpen(false);
                          resetGatewayModal();
                        }}
                        className="rounded-2xl bg-gray-100 px-5 py-3 text-sm font-bold text-gray-700 transition hover:bg-gray-200"
                      >
                        Cancel
                      </button>
                      <button
                        type="button"
                        onClick={handleCreateGateway}
                        disabled={isCreatingGateway}
                        className="inline-flex items-center gap-2 rounded-2xl bg-irms-green px-5 py-3 text-sm font-bold text-white transition hover:bg-irms-green-light disabled:cursor-not-allowed disabled:opacity-50"
                      >
                        {isCreatingGateway ? (
                          <Loader2 className="h-4 w-4 animate-spin" />
                        ) : (
                          <Save className="h-4 w-4" />
                        )}
                        Create Gateway
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
