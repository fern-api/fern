/* eslint-disable no-console */
import { App } from "@fern-api/ui";
import { FernRegistryClient } from "@fern-fern/registry-browser";
import * as FernRegistryDocsRead from "@fern-fern/registry-browser/serialization/resources/docs/resources/v2/resources/read";
import { GetServerSideProps } from "next";
import { Inter } from "next/font/google";
import Head from "next/head";

const inter = Inter({ subsets: ["latin"] });

const REGISTRY_SERVICE = new FernRegistryClient({
    environment: process.env.NEXT_PUBLIC_FDR_ORIGIN ?? "https://registry.buildwithfern.com",
});

export declare namespace Docs {
    export interface Props {
        docs: FernRegistryDocsRead.LoadDocsForUrlResponse.Raw;
        pathname: string;
    }
}

export default function Docs({ docs, pathname }: Docs.Props): JSX.Element {
    console.log(Date.now(), "Rendering Docs component");
    return (
        <main className={inter.className}>
            <Head>
                {docs.definition.config.title != null && <title>{docs.definition.config.title}</title>}
                {docs.definition.config.favicon != null && (
                    <link rel="icon" id="favicon" href={docs.definition.files[docs.definition.config.favicon]}></link>
                )}
            </Head>
            <App docs={docs} pathname={pathname} />
        </main>
    );
}

export const getServerSideProps: GetServerSideProps<Docs.Props> = async (context) => {
    console.log(Date.now(), "In getServerSideProps");
    const host = context.req.headers["x-fern-host"] ?? context.req.headers.host;
    if (host == null) {
        throw new Error("Host header is not defined");
    }

    console.log(Date.now(), "Loading docs");
    const docs = await REGISTRY_SERVICE.docs.v2.read.getDocsForUrl({
        url: process.env.NEXT_PUBLIC_DOCS_DOMAIN ?? `${host}${context.resolvedUrl}`,
    });
    console.log(Date.now(), "Loaded docs");

    if (!docs.ok) {
        // eslint-disable-next-line no-console
        console.error(docs.error);
        return { notFound: true };
    }

    console.log(Date.now(), "Serializing docs");
    const docsRaw = await FernRegistryDocsRead.LoadDocsForUrlResponse.jsonOrThrow(docs.body, {
        unrecognizedObjectKeys: "passthrough",
        allowUnrecognizedEnumValues: true,
        allowUnrecognizedUnionMembers: true,
    });
    console.log(Date.now(), "Serialized docs");

    return {
        props: {
            docs: docsRaw,
            pathname: context.query.slug != null ? (context.query.slug as string[]).join("/") : "",
        },
    };
};
