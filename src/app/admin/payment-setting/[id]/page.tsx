"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { AdminSidebar } from "@/components/admin/AdminSidebar";
import { PinModal } from "@/components/admin/payment/PinModal";
import { AuthService } from "@/services/auth.service";
import { PaymentService } from "@/services/payment.service";
import {
  PaymentCredentialEntryInput,
  PaymentCredentialsResponse,
  PaymentMethodResponse,
} from "@/types/payment.types";
import {
  ArrowLeft,
  Clock3,
  Eye,
  EyeOff,
  Loader2,
  Save,
  ShieldCheck,
  ToggleLeft,
  ToggleRight,
} from "lucide-react";

const ACCESS_TTL_SECONDS = 120;

const toDisplayString = (value: unknown): string => {
  if (value === null || value === undefined) {
    return "";
  }

  if (typeof value === "string") {
    return value;
  }

  if (typeof value === "number" || typeof value === "boolean") {
    return String(value);
  }

  try {
    return JSON.stringify(value);
  } catch {
    return String(value);
  }
};

const formatSeconds = (seconds: number) => {
  const safe = Math.max(0, seconds);
  const minutes = Math.floor(safe / 60);
  const remainder = safe % 60;
  return `${String(minutes).padStart(2, "0")}:${String(remainder).padStart(2, "0")}`;
};

export default function PaymentGatewayDetailPage() {
  const params = useParams<{ id: string }>();
  const router = useRouter();
  const gatewayId = Array.isArray(params?.id) ? params.id[0] : params?.id;

  const accessTokenRef = useRef<string | null>(null);
  const revokedRef = useRef(false);

  const [isLoading, setIsLoading] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [maskedCredential, setMaskedCredential] =
    useState<PaymentCredentialsResponse | null>(null);
  const [paymentMethod, setPaymentMethod] =
    useState<PaymentMethodResponse | null>(null);

  const [isPinModalOpen, setIsPinModalOpen] = useState(true);
  const [pinValue, setPinValue] = useState("");
  const [pinError, setPinError] = useState<string | null>(null);
  const [isVerifyingPin, setIsVerifyingPin] = useState(false);
  const [credentialToken, setCredentialToken] = useState<string | null>(null);
  const [expiresAtMs, setExpiresAtMs] = useState<number | null>(null);

  const [isRevealed, setIsRevealed] = useState(false);
  const [draftValues, setDraftValues] = useState<Record<string, string>>({});
  const [isSaving, setIsSaving] = useState(false);
  const [isTogglingStatus, setIsTogglingStatus] = useState(false);
  const [secondsLeft, setSecondsLeft] = useState(ACCESS_TTL_SECONDS);

  useEffect(() => {
    const load = async () => {
      if (!gatewayId) {
        setLoadError("Missing gateway id.");
        setIsLoading(false);
        return;
      }

      setIsLoading(true);
      setLoadError(null);

      try {
        const [credentialRes, methodRes] = await Promise.all([
          PaymentService.getPaymentCredentialsById(gatewayId),
          PaymentService.getPaymentMethods(),
        ]);

        if (!credentialRes.success || !credentialRes.data) {
          throw new Error(
            credentialRes.message || "Payment credentials not found.",
          );
        }

        setMaskedCredential(credentialRes.data);

        const method = methodRes.success
          ? (methodRes.data?.find(
              (item) => item.id === credentialRes.data.paymentMethodId,
            ) ?? null)
          : null;
        setPaymentMethod(method);
      } catch (error) {
        setLoadError(
          error instanceof Error
            ? error.message
            : "Failed to load payment credentials.",
        );
      } finally {
        setIsLoading(false);
      }
    };

    void load();
  }, [gatewayId]);

  useEffect(() => {
    if (!expiresAtMs) {
      setSecondsLeft(ACCESS_TTL_SECONDS);
      return;
    }

    const updateRemaining = () => {
      const remaining = Math.max(
        0,
        Math.ceil((expiresAtMs - Date.now()) / 1000),
      );
      setSecondsLeft(remaining);

      if (remaining <= 0) {
        void handleTokenExpired();
      }
    };

    const interval = window.setInterval(updateRemaining, 1000);
    updateRemaining();

    return () => window.clearInterval(interval);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [expiresAtMs]);

  useEffect(() => {
    return () => {
      void revokeAccessToken();
    };
  }, []);

  const fieldDefinitions = useMemo(() => {
    if (paymentMethod?.requiredFields?.length) {
      return paymentMethod.requiredFields;
    }

    return (
      maskedCredential?.credentials.map((entry) => ({
        key: entry.key,
        label: entry.label,
        type: "text" as const,
        required: true,
      })) ?? []
    );
  }, [maskedCredential, paymentMethod]);

  const maskedValues = useMemo(() => {
    return new Map(
      (maskedCredential?.credentials ?? []).map((entry) => [
        entry.key,
        entry.value,
      ]),
    );
  }, [maskedCredential]);

  const revokeAccessToken = async () => {
    if (!accessTokenRef.current || revokedRef.current) {
      return;
    }

    revokedRef.current = true;
    try {
      await PaymentService.revokePaymentCredentialsAccess(
        accessTokenRef.current,
      );
    } catch (error) {
      console.warn("Failed to revoke credential access token", error);
    } finally {
      accessTokenRef.current = null;
      setCredentialToken(null);
      setExpiresAtMs(null);
      setSecondsLeft(ACCESS_TTL_SECONDS);
      setIsRevealed(false);
      setDraftValues({});
    }
  };

  const handleTokenExpired = async () => {
    await revokeAccessToken();
    router.replace("/admin/payment-setting");
  };

  const handleVerifyPin = async () => {
    if (!pinValue || pinValue.length !== 6) {
      setPinError("Enter a 6-digit PIN.");
      return;
    }

    setIsVerifyingPin(true);
    setPinError(null);

    try {
      const response = await AuthService.verifyRestaurantPin({ pin: pinValue });
      if (!response.success || !response.data?.accessToken) {
        throw new Error(response.message || "PIN verification failed.");
      }

      accessTokenRef.current = response.data.accessToken;
      setCredentialToken(response.data.accessToken);
      revokedRef.current = false;
      setExpiresAtMs(
        Date.now() +
          (response.data.expiresInSeconds ?? ACCESS_TTL_SECONDS) * 1000,
      );
      setIsPinModalOpen(false);
      setPinValue("");
    } catch (error) {
      setPinError(
        error instanceof Error ? error.message : "PIN verification failed.",
      );
    } finally {
      setIsVerifyingPin(false);
    }
  };

  const handleToggleReveal = async () => {
    if (!maskedCredential || !gatewayId) {
      return;
    }

    if (isRevealed) {
      setIsRevealed(false);
      setDraftValues({});
      return;
    }

    if (!credentialToken) {
      setIsPinModalOpen(true);
      return;
    }

    try {
      const response = await PaymentService.getPaymentCredentialsByIdWithAccess(
        gatewayId,
        credentialToken,
      );
      if (!response.success || !response.data) {
        throw new Error(response.message || "Unable to reveal credentials.");
      }

      const nextDrafts: Record<string, string> = {};
      response.data.credentials.forEach((entry) => {
        nextDrafts[entry.key] = toDisplayString(entry.value);
      });
      setDraftValues(nextDrafts);
      setIsRevealed(true);
    } catch (error) {
      setLoadError(
        error instanceof Error
          ? error.message
          : "Unable to reveal credentials.",
      );
    }
  };

  const handleStatusToggle = async () => {
    if (!gatewayId || !maskedCredential || !credentialToken) {
      return;
    }

    setIsTogglingStatus(true);
    try {
      const response = await PaymentService.updatePaymentCredentialsWithAccess(
        gatewayId,
        credentialToken,
        { isActive: !maskedCredential.isActive },
      );

      if (!response.success || !response.data) {
        throw new Error(response.message || "Failed to update gateway status.");
      }

      setMaskedCredential((current) =>
        current ? { ...current, isActive: response.data.isActive } : current,
      );
    } catch (error) {
      setLoadError(
        error instanceof Error
          ? error.message
          : "Failed to update gateway status.",
      );
    } finally {
      setIsTogglingStatus(false);
    }
  };

  const handleSaveChanges = async () => {
    if (!gatewayId || !credentialToken || !maskedCredential || !isRevealed) {
      return;
    }

    setIsSaving(true);
    try {
      const credentialsPayload: PaymentCredentialEntryInput[] =
        fieldDefinitions.map((field) => ({
          key: field.key,
          label: field.label ?? field.key,
          value: draftValues[field.key] ?? "",
        }));

      const response = await PaymentService.updatePaymentCredentialsWithAccess(
        gatewayId,
        credentialToken,
        {
          isActive: maskedCredential.isActive,
          credentials: credentialsPayload,
        },
      );

      if (!response.success || !response.data) {
        throw new Error(response.message || "Failed to save credentials.");
      }

      const maskedRefresh =
        await PaymentService.getPaymentCredentialsById(gatewayId);
      if (maskedRefresh.success && maskedRefresh.data) {
        setMaskedCredential(maskedRefresh.data);
      }
      const nextDrafts: Record<string, string> = {};
      response.data.credentials.forEach((entry) => {
        nextDrafts[entry.key] = toDisplayString(entry.value);
      });
      setDraftValues(nextDrafts);
    } catch (error) {
      setLoadError(
        error instanceof Error ? error.message : "Failed to save credentials.",
      );
    } finally {
      setIsSaving(false);
    }
  };

  const leaveDetail = async () => {
    await revokeAccessToken();
    router.push("/admin/payment-setting");
  };

  const statusActive = maskedCredential?.isActive ?? false;

  return (
    <div className="min-h-screen bg-[#F4F7F6] flex">
      <AdminSidebar />

      <main className="flex-1 ml-60">
        <div className="mx-auto max-w-7xl px-8 py-8">
          <button
            type="button"
            onClick={leaveDetail}
            className="mb-6 inline-flex h-11 w-11 items-center justify-center rounded-2xl bg-white text-gray-600 shadow-sm ring-1 ring-black/5 transition hover:bg-gray-50 hover:text-irms-text-primary"
          >
            <ArrowLeft className="h-5 w-5" />
          </button>

          <div className="mb-8 flex flex-wrap items-start justify-between gap-4">
            <div>
              <p className="text-xs font-bold uppercase tracking-[0.3em] text-gray-500">
                Payment Settings
              </p>
              <h1 className="mt-3 text-3xl font-bold text-irms-text-primary">
                {paymentMethod?.name ?? "Gateway"} Configuration
              </h1>
              <p className="mt-3 max-w-3xl text-sm leading-6 text-gray-600">
                Manage masked or revealed credentials for this gateway. Reveal
                access requires PIN verification and expires in 2 minutes.
              </p>
            </div>

            <div
              className={`rounded-2xl bg-white px-4 py-3 shadow-sm ring-1 ring-black/5 ${statusActive ? "ring-emerald-100" : "ring-slate-200"}`}
            >
              <div className="flex items-center gap-4">
                <div
                  className={`flex h-11 w-11 items-center justify-center rounded-xl ${statusActive ? "bg-emerald-50 text-emerald-600" : "bg-slate-50 text-slate-500"}`}
                >
                  <ShieldCheck className="h-5 w-5" />
                </div>
                <div>
                  <div className="text-[11px] font-bold uppercase tracking-[0.3em] text-gray-400">
                    Gateway Status
                  </div>
                  <div className="mt-1 flex items-center gap-2">
                    <span
                      className={`h-2.5 w-2.5 rounded-full ${statusActive ? "bg-emerald-500" : "bg-slate-400"}`}
                    />
                    <span className="text-sm font-bold text-irms-text-primary">
                      {statusActive ? "Active" : "Standby"}
                    </span>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={handleStatusToggle}
                  disabled={isTogglingStatus}
                  className={`ml-2 inline-flex items-center gap-2 rounded-full px-3 py-2 text-xs font-bold uppercase tracking-[0.2em] transition ${
                    statusActive
                      ? "bg-emerald-50 text-emerald-700 hover:bg-emerald-100"
                      : "bg-slate-100 text-slate-700 hover:bg-slate-200"
                  } disabled:cursor-not-allowed disabled:opacity-50`}
                >
                  {isTogglingStatus ? (
                    <Loader2 className="h-3.5 w-3.5 animate-spin" />
                  ) : statusActive ? (
                    <ToggleRight className="h-4 w-4" />
                  ) : (
                    <ToggleLeft className="h-4 w-4" />
                  )}
                  {statusActive ? "Deactivate" : "Activate"}
                </button>
              </div>
            </div>
          </div>

          {loadError && (
            <div className="mb-6 rounded-2xl border border-red-100 bg-red-50 px-4 py-3 text-sm text-red-700">
              {loadError}
            </div>
          )}

          {isLoading ? (
            <div className="rounded-4xl bg-white p-10 text-center shadow-sm ring-1 ring-black/5">
              <Loader2 className="mx-auto mb-4 h-6 w-6 animate-spin text-irms-green" />
              Loading credential detail...
            </div>
          ) : maskedCredential ? (
            <>
              <section className="rounded-4xl bg-white p-7 shadow-sm ring-1 ring-black/5">
                <div className="mb-6 flex flex-wrap items-start justify-between gap-4">
                  <div className="max-w-3xl">
                    <h2 className="text-xl font-bold text-irms-text-primary">
                      Gateway credentials
                    </h2>
                    <p className="mt-2 text-sm leading-6 text-gray-600">
                      Credentials remain masked until you review them. Hiding
                      them again removes the revealed values from local memory.
                    </p>
                  </div>

                  <div className="flex items-center gap-3">
                    <div className="rounded-full bg-white px-4 py-2 text-xs font-bold uppercase tracking-[0.25em] text-gray-500 ring-1 ring-black/5">
                      <Clock3 className="mr-2 inline-block h-4 w-4 text-irms-green" />
                      {formatSeconds(secondsLeft)} left
                    </div>

                    <button
                      type="button"
                      onClick={handleToggleReveal}
                      className="inline-flex items-center gap-2 rounded-2xl bg-gray-100 px-5 py-3 text-sm font-bold text-irms-text-primary transition hover:bg-gray-200"
                    >
                      {isRevealed ? (
                        <EyeOff className="h-4 w-4" />
                      ) : (
                        <Eye className="h-4 w-4" />
                      )}
                      {isRevealed ? "Hide" : "Review"}
                    </button>
                  </div>
                </div>

                <div className="grid gap-4">
                  {fieldDefinitions.map((field) => {
                    const maskedValue = String(
                      maskedValues.get(field.key) ?? "****",
                    );
                    const revealedValue = draftValues[field.key] ?? "";

                    return (
                      <div
                        key={field.key}
                        className="grid gap-4 rounded-3xl bg-[#F8FAFB] p-5 ring-1 ring-black/5 md:grid-cols-[minmax(180px,240px)_1fr_auto]"
                      >
                        <div>
                          <div className="text-sm font-bold uppercase tracking-[0.2em] text-gray-500">
                            {field.label ?? field.key}
                          </div>
                          <div className="mt-2 text-sm text-gray-500">
                            {field.key}
                          </div>
                        </div>

                        <div className="flex items-center">
                          {isRevealed ? (
                            <input
                              type={
                                field.type === "password" ? "password" : "text"
                              }
                              value={revealedValue}
                              onChange={(event) =>
                                setDraftValues((current) => ({
                                  ...current,
                                  [field.key]: event.target.value,
                                }))
                              }
                              className="w-full rounded-2xl border border-gray-200 bg-white px-4 py-3 font-mono text-sm text-gray-800 outline-none transition focus:border-irms-green focus:ring-2 focus:ring-irms-green/15"
                            />
                          ) : (
                            <div className="w-full rounded-2xl border border-dashed border-gray-300 bg-white px-4 py-3 font-mono text-sm tracking-[0.25em] text-gray-500">
                              {maskedValue || "••••••••"}
                            </div>
                          )}
                        </div>

                        <div className="flex items-center justify-end">
                          <span
                            className={`rounded-full px-3 py-2 text-xs font-bold uppercase tracking-[0.2em] ${isRevealed ? "bg-emerald-50 text-emerald-700" : "bg-slate-100 text-slate-500"}`}
                          >
                            {isRevealed ? "Editable" : "Masked"}
                          </span>
                        </div>
                      </div>
                    );
                  })}
                </div>

                {isRevealed && (
                  <div className="mt-6 flex flex-wrap items-center justify-end gap-3">
                    <button
                      type="button"
                      onClick={handleToggleReveal}
                      className="rounded-2xl bg-gray-100 px-5 py-3 text-sm font-bold text-irms-text-primary transition hover:bg-gray-200"
                    >
                      Hide values
                    </button>
                    <button
                      type="button"
                      onClick={handleSaveChanges}
                      disabled={isSaving}
                      className="inline-flex items-center gap-2 rounded-2xl bg-irms-green px-5 py-3 text-sm font-bold text-white transition hover:bg-irms-green-light disabled:cursor-not-allowed disabled:opacity-50"
                    >
                      {isSaving ? (
                        <Loader2 className="h-4 w-4 animate-spin" />
                      ) : (
                        <Save className="h-4 w-4" />
                      )}
                      Save changes
                    </button>
                  </div>
                )}
              </section>
            </>
          ) : null}
        </div>
      </main>

      <PinModal
        open={isPinModalOpen}
        title="Enter Security PIN"
        description="Please enter your 6-digit PIN to unlock sensitive payment credentials."
        value={pinValue}
        onChange={setPinValue}
        onSubmit={handleVerifyPin}
        onClose={leaveDetail}
        submitting={isVerifyingPin}
        error={pinError ?? undefined}
      />
    </div>
  );
}
