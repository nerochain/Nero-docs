import { useEffect } from "react";
import { useRouter } from "nextra/hooks";

export default function Index() {
  const router = useRouter();

  useEffect(() => {
    const userLang = navigator.language;

    if (userLang.startsWith("ja")) {
      void router.replace("/ja");
    } else {
      void router.replace("/en");
    }
  }, [router]);

  return null;
}
