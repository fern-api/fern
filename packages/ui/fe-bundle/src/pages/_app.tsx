import { FernRegistryClient } from "@fern-fern/registry-browser";
import * as FernRegistryDocsRead from "@fern-fern/registry-browser/serialization/resources/docs/resources/v2/resources/read";
import App, { AppContext, AppInitialProps, AppProps } from "next/app";
import Head from "next/head";
import "../styles/globals.css";

export declare namespace CustomApp {
    export interface Props {
        docs: FernRegistryDocsRead.LoadDocsForUrlResponse.Raw;
        pathname: string;
    }
}

const REGISTRY_SERVICE = new FernRegistryClient({
    environment: process.env.NEXT_PUBLIC_FDR_ORIGIN ?? "https://registry.buildwithfern.com",
});

export default function CustomApp({ Component, pageProps, docs, pathname }: AppProps & CustomApp.Props): JSX.Element {
    return (
        <>
            <Head>
                <title>Documentation</title>
            </Head>
            <Component {...pageProps} docs={docs} pathname={pathname} />
        </>
    );
}

CustomApp.getInitialProps = async (context: AppContext): Promise<AppInitialProps & CustomApp.Props> => {
    const defaultInitialProps = await App.getInitialProps(context);

    const host = context.ctx.req?.headers["x-fern-host"] ?? context.ctx.req?.headers.host;
    if (host == null) {
        throw new Error("Host header is not defined");
    }

    const docs = await REGISTRY_SERVICE.docs.v2.read.getDocsForUrl({
        url: process.env.NEXT_PUBLIC_DOCS_DOMAIN ?? `${host}${context.ctx.pathname}`,
    });

    if (!docs.ok) {
        // eslint-disable-next-line no-console
        console.error(docs.error);
        throw new Error("Failed to load docs");
    }

    return {
        ...defaultInitialProps,
        docs: await FernRegistryDocsRead.LoadDocsForUrlResponse.jsonOrThrow(docs.body, {
            unrecognizedObjectKeys: "passthrough",
            allowUnrecognizedEnumValues: true,
            allowUnrecognizedUnionMembers: true,
        }),
        pathname: context.ctx.query.slug != null ? (context.ctx.query.slug as string[]).join("/") : "",
    };
};
