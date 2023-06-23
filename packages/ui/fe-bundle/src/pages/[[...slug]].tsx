import { App, ResolvedUrlPath } from "@fern-api/ui";
import { FernRegistryClient } from "@fern-fern/registry-browser";
import * as FernRegistryDocsRead from "@fern-fern/registry-browser/api/resources/docs/resources/v2/resources/read";
import { GetServerSideProps } from "next";
import { Inter } from "next/font/google";
import Head from "next/head";
import { UrlPathResolver } from "../url-path-resolver/UrlPathResolver";

const inter = Inter({ subsets: ["latin"] });

const REGISTRY_SERVICE = new FernRegistryClient({
    environment: process.env.NEXT_PUBLIC_FDR_ORIGIN ?? "https://registry.buildwithfern.com",
});

export declare namespace Docs {
    export interface Props {
        docs: FernRegistryDocsRead.LoadDocsForUrlResponse;
        pathname: string;
        resolvedUrlPath: ResolvedUrlPath;
    }
}

export default function Docs({ docs, pathname, resolvedUrlPath }: Docs.Props): JSX.Element {
    return (
        <main className={inter.className}>
            <Head>
                {docs.definition.config.title != null && <title>{docs.definition.config.title}</title>}
                {docs.definition.config.favicon != null && (
                    <link rel="icon" id="favicon" href={docs.definition.files[docs.definition.config.favicon]}></link>
                )}
            </Head>
            <App docs={docs} pathname={pathname} resolvedUrlPath={resolvedUrlPath} />
        </main>
    );
}

export const getServerSideProps: GetServerSideProps<Docs.Props> = async (context) => {
    const host = context.req.headers["x-fern-host"] ?? context.req.headers.host;
    if (host == null) {
        throw new Error("Host header is not defined");
    }

    const docs = await REGISTRY_SERVICE.docs.v2.read.getDocsForUrl({
        url: process.env.NEXT_PUBLIC_DOCS_DOMAIN ?? `${host}${context.resolvedUrl}`,
    });

    if (!docs.ok) {
        // eslint-disable-next-line no-console
        console.error(docs.error);
        return { notFound: true };
    }

    const pathname = context.query.slug != null ? (context.query.slug as string[]).join("/") : "";
    const slug =
        docs.body.baseUrl.basePath != null
            ? pathname.replace(new RegExp(`^${docs.body.baseUrl.basePath}`), "")
            : pathname;
    const slugWithoutLeadingOrTrailingSlashes = removeLeadingAndTrailingSlashes(slug);

    const urlPathResolver = new UrlPathResolver(docs.body.definition);
    const resolvedUrlPath = await urlPathResolver.resolveSlug(slugWithoutLeadingOrTrailingSlashes);
    if (resolvedUrlPath == null) {
        return { notFound: true };
    }

    return {
        props: {
            docs: docs.body,
            resolvedUrlPath,
            pathname: context.query.slug != null ? (context.query.slug as string[]).join("/") : "",
        },
    };
};

function removeLeadingAndTrailingSlashes(s: string): string {
    if (s.startsWith("/")) {
        s = s.substring(1);
    }
    if (s.endsWith("/")) {
        s = s.substring(0, s.length - 1);
    }
    return s;
}
