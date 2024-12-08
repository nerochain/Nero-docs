import { useEffect } from "react";
import { useRouter } from "nextra/hooks";

export default function Index() {
  const router = useRouter();

  useEffect(() => {
    void router.replace("/en");
  }, [router]);

  return null;
}
