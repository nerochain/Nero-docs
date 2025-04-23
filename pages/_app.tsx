import React, { useEffect } from "react";
import "katex/dist/katex.min.css";
import "../styles/global.css";
import { useRouter } from "nextra/hooks";

export default function App({ Component, pageProps }) {
  const router = useRouter();

  React.useEffect(() => {
    if (!router.locale && router.pathname !== "/") {
      router.push(router.pathname, router.asPath, { locale: "en" });
    }
  }, [router.locale, router.pathname]);

  useEffect(() => {
    const isHomepage =
      router.asPath === "/en" ||
      router.asPath === "/en/" ||
      router.asPath === "/ja" ||
      router.asPath === "/ja/";

    if (isHomepage) {
      document.body.setAttribute("data-nextra-hide-sidebar", "true");
    } else {
      document.body.removeAttribute("data-nextra-hide-sidebar");
    }
  }, [router.asPath]);

  return <Component {...pageProps} />;
}
