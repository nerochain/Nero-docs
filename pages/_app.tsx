import React from 'react'
import 'katex/dist/katex.min.css'
import { useRouter } from 'nextra/hooks'

export default function App({ Component, pageProps }) {
    const router = useRouter()
    
    // デフォルト言語を英語に設定
    React.useEffect(() => {
        if (!router.locale) {
            router.push(router.pathname, router.asPath, { locale: 'en' })
        }
    }, [router.locale])

    return <Component {...pageProps} />
}