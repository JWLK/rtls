import { Html, Head, Main, NextScript } from 'next/document'

export default function Document() {
    return (
        <Html lang="kr">
            <Head>
                <meta
                    name="viewport"
                    content="width=device-width, initial-scale=1.0, maximum-scale=1.0, minimum-scale=1.0, user-scale=1.0, user-scalable=no, viewport-fit=cover, shrink-to-fit=no"
                ></meta>
                <script
                    src={`https://maps.googleapis.com/maps/api/js?key=${process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY}`}
                ></script>
                <link rel="manifest" href="/manifest.json" />
                <meta name="apple-mobile-web-app-capable" content="yes"></meta>
                <meta
                    name="apple-mobile-web-app-status-bar-style"
                    content="black-translucent"
                />
                <meta name="mobile-web-app-capable" content="yes"></meta>
                <meta name="theme-color" content="#373737" />
            </Head>
            <body>
                <Main />
                <NextScript />
            </body>
        </Html>
    )
}
