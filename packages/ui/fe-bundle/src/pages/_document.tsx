import { Head, Html, Main, NextScript } from "next/document";

export default function Document(): JSX.Element {
    return (
        <Html lang="en">
            <Head />
            <body className="overscroll-y-none">
                <span
                    style={{
                        backgroundImage: "var(--docs-background-image, url('/backgrounds/default.png'))",
                    }}
                    className="fixed inset-0 bg-fixed bg-right-top bg-no-repeat"
                />
                <Main />
                <NextScript />
            </body>
        </Html>
    );
}
