import { Html, Head, Main, NextScript } from 'next/document'

export default function Document() {
    return (
        <Html lang="kr">
            <Head>
                {/* <meta name="viewport" content="viewport-fit=cover" /> */}
                <meta
                    name="apple-mobile-web-app-status-bar-style"
                    content="black-translucent"
                />
                <meta name="theme-color" content="#373737" />
                {/* 원하는 색상으로 변경 */}
            </Head>
            <body>
                <Main />
                <NextScript />
            </body>
        </Html>
    )
}
