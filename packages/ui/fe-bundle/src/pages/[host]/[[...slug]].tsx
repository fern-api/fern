import { App, ResolvedUrlPath } from "@fern-api/ui";
import * as FernRegistryDocsRead from "@fern-fern/registry-browser/api/resources/docs/resources/v2/resources/read";
import { GetStaticPaths, GetStaticProps } from "next";
import { Inter } from "next/font/google";
import Head from "next/head";
import { REGISTRY_SERVICE } from "../../service";
import { UrlPathResolver } from "../../url-path-resolver/UrlPathResolver";

const inter = Inter({ subsets: ["latin"] });

export declare namespace Docs {
    export interface Props {
        docs: FernRegistryDocsRead.LoadDocsForUrlResponse;
        resolvedUrlPath: ResolvedUrlPath;
    }
}

export default function Docs({ docs, resolvedUrlPath }: Docs.Props): JSX.Element {
    return (
        <main className={inter.className}>
            <Head>
                {docs.definition.config.title != null && <title>{docs.definition.config.title}</title>}
                {docs.definition.config.favicon != null && (
                    <link rel="icon" id="favicon" href={docs.definition.files[docs.definition.config.favicon]}></link>
                )}
            </Head>
            <App docs={docs} resolvedUrlPath={resolvedUrlPath} />
        </main>
    );
}

export const getStaticProps: GetStaticProps<Docs.Props> = async ({ params = {} }) => {
    const { host, slug: slugArray } = params;

    if (host == null) {
        throw new Error("host is not defined");
    }

    const pathname = slugArray != null ? (slugArray as string[]).join("/") : "";
    const docs = await REGISTRY_SERVICE.docs.v2.read.getDocsForUrl({
        url: process.env.NEXT_PUBLIC_DOCS_DOMAIN ?? `${host}${pathname}`,
    });

    if (!docs.ok) {
        // eslint-disable-next-line no-console
        console.error("Failed to fetch docs", docs.error);
        return { notFound: true };
    }

    const urlPathResolver = new UrlPathResolver(docs.body.definition);
    const resolvedUrlPath = await urlPathResolver.resolveUrl({ pathname, docsBasePath: docs.body.baseUrl.basePath });
    if (resolvedUrlPath == null) {
        return { notFound: true };
    }

    return {
        props: {
            docs: docs.body,
            resolvedUrlPath,
        },
    };
};

export const getStaticPaths: GetStaticPaths = () => {
    return { paths: [], fallback: "blocking" };
};
