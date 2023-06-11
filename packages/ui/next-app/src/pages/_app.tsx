import type { AppProps } from "next/app";
import Head from "next/head";
import "../styles/globals.css";

export default function App({ Component, pageProps }: AppProps): JSX.Element {
    return (
        <>
            <Head>
                <title>Documentation</title>
            </Head>
            <Component {...pageProps} />
        </>
    );
}
