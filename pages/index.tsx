import { useEffect } from "react";
import { useRouter } from "nextra/hooks";

export default function Index() {
  const router = useRouter();

  useEffect(() => {
    if (typeof window !== "undefined") {
      const urlParams = new URLSearchParams(window.location.search);
      const langParam = urlParams.get("lang");

      if (langParam === "ja") {
        void router.replace("/ja");
      } else if (langParam === "en") {
        void router.replace("/en");
      } else {
        const userLang = navigator.language;

        if (userLang.startsWith("ja")) {
          void router.replace("/ja");
        } else {
          void router.replace("/en");
        }
      }
    }
  }, [router]);

  return null;
}
