import { useEffect, useRef, useState } from "react";

declare global {
  interface Window {
    google?: {
      accounts: {
        id: {
          initialize: (options: {
            client_id: string;
            callback: (response: { credential?: string }) => void;
          }) => void;
          renderButton: (parent: HTMLElement, options: Record<string, unknown>) => void;
        };
      };
    };
  }
}

let googleScriptPromise: Promise<void> | null = null;

function loadGoogleScript() {
  if (window.google?.accounts?.id) {
    return Promise.resolve();
  }

  if (!googleScriptPromise) {
    googleScriptPromise = new Promise((resolve, reject) => {
      const existingScript = document.getElementById("google-gsi-script") as HTMLScriptElement | null;
      if (existingScript) {
        existingScript.addEventListener("load", () => resolve(), { once: true });
        existingScript.addEventListener("error", () => reject(new Error("Failed to load Google script")), {
          once: true,
        });
        return;
      }

      const script = document.createElement("script");
      script.id = "google-gsi-script";
      script.src = "https://accounts.google.com/gsi/client";
      script.async = true;
      script.defer = true;
      script.onload = () => resolve();
      script.onerror = () => reject(new Error("Failed to load Google script"));
      document.head.appendChild(script);
    });
  }

  return googleScriptPromise;
}

interface GoogleSignInButtonProps {
  clientId?: string;
  onCredential: (credential: string) => Promise<void> | void;
  disabled?: boolean;
}

export function GoogleSignInButton({ clientId, onCredential, disabled }: GoogleSignInButtonProps) {
  const buttonRef = useRef<HTMLDivElement | null>(null);
  const [scriptError, setScriptError] = useState<string | null>(null);

  useEffect(() => {
    let active = true;

    if (!clientId || !buttonRef.current) {
      return undefined;
    }

    setScriptError(null);

    loadGoogleScript()
      .then(() => {
        if (!active || !buttonRef.current || !window.google?.accounts?.id) {
          return;
        }

        buttonRef.current.innerHTML = "";
        window.google.accounts.id.initialize({
          client_id: clientId,
          callback: async (response) => {
            if (response.credential) {
              await onCredential(response.credential);
            }
          },
        });

        window.google.accounts.id.renderButton(buttonRef.current, {
          type: "standard",
          theme: "outline",
          size: "medium",
          text: "signin_with",
          shape: "pill",
          logo_alignment: "left",
          width: 320,
        });
      })
      .catch((error: unknown) => {
        if (active) {
          setScriptError(error instanceof Error ? error.message : "Google sign-in is unavailable");
        }
      });

    return () => {
      active = false;
      if (buttonRef.current) {
        buttonRef.current.innerHTML = "";
      }
    };
  }, [clientId, onCredential]);

  if (!clientId) {
    return (
      <button
        type="button"
        disabled
        className="w-full h-11 rounded-xl border border-slate-200 bg-slate-50 text-slate-400 text-xs font-semibold cursor-not-allowed"
      >
        Google login is not configured
      </button>
    );
  }

  return (
    <div className="rounded-2xl border border-slate-200 bg-slate-50/80 p-2 shadow-[inset_0_1px_0_rgba(255,255,255,0.65)]">
      <div
        ref={buttonRef}
        className={`${disabled ? "pointer-events-none opacity-60" : ""} flex justify-center`}
      />
      {scriptError ? <p className="mt-2 text-[11px] text-red-500 text-center">{scriptError}</p> : null}
    </div>
  );
}
