import { assertNeverNoThrow } from "@fern-api/core-utils";
import { App, ResolvedUrlPath } from "@fern-api/ui";
import * as FernRegistryDocsReadV1 from "@fern-fern/registry-browser/api/resources/docs/resources/v1/resources/read";
import * as FernRegistryDocsReadV2 from "@fern-fern/registry-browser/api/resources/docs/resources/v2/resources/read";
import { GetStaticPaths, GetStaticProps } from "next";
import { Inter } from "next/font/google";
import Head from "next/head";
import { StyleSheet } from "../../components/renderers/Stylesheet";
import { REGISTRY_SERVICE } from "../../service";
import { getSlugFromUrl } from "../../url-path-resolver/getSlugFromUrl";
import { UrlPathResolver } from "../../url-path-resolver/UrlPathResolver";
import { loadDocsBackgroundImage } from "../../utils/theme/loadDocsBackgroundImage";
import { generateFontFaces, loadDocTypography } from "../../utils/theme/loadDocsTypography";

function classNames(...classes: (string | undefined)[]): string {
    return classes.filter((c) => c != null).join(" ");
}

const inter = Inter({ subsets: ["latin"] });

export declare namespace Docs {
    export interface Props {
        docs: FernRegistryDocsReadV2.LoadDocsForUrlResponse;
        resolvedUrlPath: ResolvedUrlPath;
        typographyStyleSheet: string | undefined;
        backgroundImageStyleSheet: string | undefined;
        nextPath: ResolvedUrlPath | null;
        previousPath: ResolvedUrlPath | null;
    }
}

export default function Docs({
    docs,
    typographyStyleSheet,
    backgroundImageStyleSheet,
    resolvedUrlPath,
    nextPath,
    previousPath,
}: Docs.Props): JSX.Element {
    return (
        <>
            {typographyStyleSheet != null && <StyleSheet stylesheet={typographyStyleSheet} />}
            {backgroundImageStyleSheet != null && <StyleSheet stylesheet={backgroundImageStyleSheet} />}
            <main className={classNames(inter.className, "typography-font-body")}>
                <Head>
                    {docs.definition.config.title != null && <title>{docs.definition.config.title}</title>}
                    {docs.definition.config.favicon != null && (
                        <link rel="icon" id="favicon" href={docs.definition.files[docs.definition.config.favicon]} />
                    )}
                </Head>
                <App
                    docs={docs}
                    resolvedUrlPath={resolvedUrlPath}
                    nextPath={nextPath ?? undefined}
                    previousPath={previousPath ?? undefined}
                />
            </main>
        </>
    );
}

export const getStaticProps: GetStaticProps<Docs.Props> = async ({ params = {} }) => {
    const host = params.host as string | undefined;
    const slugArray = params.slug as string[] | undefined;

    if (host == null) {
        throw new Error("host is not defined");
    }

    const pathname = slugArray != null ? slugArray.join("/") : "";
    const docs = await REGISTRY_SERVICE.docs.v2.read.getDocsForUrl({
        url: process.env.NEXT_PUBLIC_DOCS_DOMAIN ?? buildUrl({ host, pathname }),
    });

    if (!docs.ok) {
        // eslint-disable-next-line no-console
        console.error("Failed to fetch docs", docs.error);
        return {
            notFound: true,
            revalidate: true,
        };
    }

    let slug = getSlugFromUrl({ pathname, basePath: docs.body.baseUrl.basePath });
    if (slug === "") {
        const firstNavigationItem = docs.body.definition.config.navigation.items[0];
        if (firstNavigationItem != null) {
            slug = firstNavigationItem.urlSlug;
        } else {
            return { notFound: true, revalidate: true };
        }
    }

    const urlPathResolver = new UrlPathResolver(docs.body.definition);
    let resolvedUrlPath = await urlPathResolver.resolveSlug(slug);
    if (resolvedUrlPath?.type === "section") {
        const firstNavigatableItem = getFirstNavigatableItem(resolvedUrlPath.section);
        if (firstNavigatableItem == null) {
            resolvedUrlPath = undefined;
        } else {
            resolvedUrlPath = await urlPathResolver.resolveSlug(firstNavigatableItem);
        }
    }

    if (resolvedUrlPath == null) {
        return { notFound: true, revalidate: true };
    }

    const typographyConfig = loadDocTypography(docs.body.definition);
    const typographyStyleSheet = generateFontFaces(typographyConfig);

    const backgroundImageStyleSheet = loadDocsBackgroundImage(docs.body.definition);

    return {
        props: {
            docs: docs.body,
            typographyStyleSheet,
            backgroundImageStyleSheet,
            resolvedUrlPath,
            nextPath: (await urlPathResolver.getNextNavigatableItem(resolvedUrlPath)) ?? null,
            previousPath: (await urlPathResolver.getPreviousNavigatableItem(resolvedUrlPath)) ?? null,
        },
        revalidate: true,
    };
};

export const getStaticPaths: GetStaticPaths = () => {
    return { paths: [], fallback: "blocking" };
};

function getFirstNavigatableItem(section: FernRegistryDocsReadV1.DocsSection, slugPrefix?: string): string | undefined {
    for (const item of section.items) {
        switch (item.type) {
            case "api":
            case "page": {
                const parts = [];
                if (slugPrefix != null) {
                    parts.push(slugPrefix);
                }
                parts.push(section.urlSlug, item.urlSlug);
                return parts.join("/");
            }
            case "section":
                return getFirstNavigatableItem(item, section.urlSlug);
            default:
                assertNeverNoThrow(item);
        }
    }
    return undefined;
}

function buildUrl({ host, pathname }: { host: string; pathname: string }): string {
    const hostWithoutTrailingSlash = host.endsWith("/") ? host.slice(0, -1) : host;
    if (pathname.length === 0) {
        return hostWithoutTrailingSlash;
    }
    return `${hostWithoutTrailingSlash}/${pathname}`;
}
