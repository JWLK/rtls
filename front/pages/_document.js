import { Html, Head, Main, NextScript } from 'next/document'

export default function Document() {
    return (
        <Html lang="kr">
            <Head>
                {/* <meta name="viewport" content="viewport-fit=cover" /> */}
                <link rel="manifest" href="/manifest.json" />
                <meta
                    name="apple-mobile-web-app-status-bar-style"
                    content="black-translucent"
                />
                <meta name="theme-color" content="#373737" />
            </Head>
            <body>
                <Main />
                <NextScript />
            </body>
        </Html>
    )
}
