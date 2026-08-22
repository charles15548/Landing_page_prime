"use client";

import { useState } from "react";
import { getSupabaseBrowserClient } from "../../lib/supabase-admin";

type Step = "idle" | "loading-login" | "logged-in" | "confirming" | "done" | "error";

export default function EliminarCuentaPage() {
  const [step, setStep] = useState<Step>("idle");
  const [email, setEmail] = useState<string | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const supabase = getSupabaseBrowserClient();

  async function handleLogin() {
    setStep("loading-login");
    const { error } = await supabase.auth.signInWithOAuth({
      provider: "google",
      options: { redirectTo: `${window.location.origin}/eliminar-cuenta` },
    });
    if (error) {
      setErrorMsg(error.message);
      setStep("error");
    }
  }

  async function checkSession() {
    const { data } = await supabase.auth.getSession();
    if (data.session) {
      setEmail(data.session.user.email ?? null);
      setStep("logged-in");
    }
  }

  useState(() => {
    checkSession();
  });

  async function handleDelete() {
    setStep("confirming");
    const { data } = await supabase.auth.getSession();
    const token = data.session?.access_token;

    if (!token) {
      setErrorMsg("Tu sesión expiró. Vuelve a iniciar sesión.");
      setStep("error");
      return;
    }

    const res = await fetch("/api/delete-account", {
      method: "POST",
      headers: { Authorization: `Bearer ${token}` },
    });

    if (res.ok) {
      await supabase.auth.signOut();
      setStep("done");
    } else {
      const body = await res.json().catch(() => ({}));
      setErrorMsg(body.error ?? "No se pudo eliminar la cuenta.");
      setStep("error");
    }
  }

  return (
    <main className="min-h-screen flex items-center justify-center bg-gray-50 px-4">
      <div className="max-w-md w-full bg-white rounded-xl shadow p-8 space-y-6">
        <h1 className="text-xl font-semibold text-gray-900">
          Eliminar cuenta — PRIME
        </h1>

        {step === "done" ? (
          <p className="text-green-700">
            Tu cuenta y datos asociados han sido eliminados correctamente.
          </p>
        ) : (
          <>
            <p className="text-sm text-gray-600">
              Al eliminar tu cuenta se borrarán permanentemente tu perfil,
              progreso de entrenamiento y suscripción asociada. Esta acción
              no se puede deshacer.
            </p>

            {step === "idle" || step === "loading-login" ? (
              <button
                onClick={handleLogin}
                disabled={step === "loading-login"}
                className="w-full py-2.5 rounded-lg bg-blue-600 text-white font-medium hover:bg-blue-700 disabled:opacity-60"
              >
                {step === "loading-login"
                  ? "Redirigiendo..."
                  : "Iniciar sesión con Google para continuar"}
              </button>
            ) : null}

            {step === "logged-in" && (
              <div className="space-y-3">
                <p className="text-sm text-gray-700">
                  Sesión iniciada como <strong>{email}</strong>
                </p>
                <button
                  onClick={handleDelete}
                  className="w-full py-2.5 rounded-lg bg-red-600 text-white font-medium hover:bg-red-700"
                >
                  Eliminar mi cuenta permanentemente
                </button>
              </div>
            )}

            {step === "confirming" && (
              <p className="text-sm text-gray-500">Eliminando cuenta...</p>
            )}

            {step === "error" && errorMsg && (
              <p className="text-sm text-red-600">{errorMsg}</p>
            )}
          </>
        )}
      </div>
    </main>
  );
}