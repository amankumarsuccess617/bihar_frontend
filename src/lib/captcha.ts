declare global {
  interface Window {
    grecaptcha?: {
      ready: (cb: () => void) => void;
      execute: (
        siteKey: string,
        opts: { action: string }
      ) => Promise<string>;
    };
  }
}

export function recaptchaSiteKey(): string | null {
  const k = process.env.NEXT_PUBLIC_RECAPTCHA_SITE_KEY;
  return k && String(k).trim() ? String(k).trim() : null;
}

export function loadRecaptcha(siteKey: string): Promise<void> {
  return new Promise((resolve, reject) => {
    if (typeof window === "undefined") {
      reject(new Error("No window"));
      return;
    }
    if (window.grecaptcha) {
      resolve();
      return;
    }
    const id = "recaptcha-v3-script";
    if (!document.getElementById(id)) {
      const s = document.createElement("script");
      s.id = id;
      s.async = true;
      s.src = `https://www.google.com/recaptcha/api.js?render=${encodeURIComponent(
        siteKey
      )}`;
      s.onload = () => resolve();
      s.onerror = () => reject(new Error("Failed to load reCAPTCHA"));
      document.head.appendChild(s);
    } else {
      resolve();
    }
  });
}

/** reCAPTCHA v3 token — must match CAPTCHA_SECRET on backend */
export async function getCaptchaToken(action: string): Promise<string | null> {
  const siteKey = recaptchaSiteKey();
  if (!siteKey) return null;
  await loadRecaptcha(siteKey);
  const g = window.grecaptcha;
  if (!g) throw new Error("reCAPTCHA not initialised");
  await new Promise<void>((resolve) => {
    g.ready(resolve);
  });
  return g.execute(siteKey, { action });
}
