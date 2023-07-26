import { assertNeverNoThrow } from "@fern-api/core-utils";
import { App, ResolvedUrlPath } from "@fern-api/ui";
import * as FernRegistryDocsReadV1 from "@fern-fern/registry-browser/api/resources/docs/resources/v1/resources/read";
import * as FernRegistryDocsReadV2 from "@fern-fern/registry-browser/api/resources/docs/resources/v2/resources/read";
import { GetStaticPaths, GetStaticProps } from "next";
import { Inter } from "next/font/google";
import Head from "next/head";
import { REGISTRY_SERVICE } from "../../service";
import { getSlugFromUrl } from "../../url-path-resolver/getSlugFromUrl";
import { UrlPathResolver } from "../../url-path-resolver/UrlPathResolver";
import { isVersionedNavigationConfig } from "../../utils/docs";
import { generateFontFaces, loadDocTypography } from "../../utils/theme/loadDocsTypography";

function classNames(...classes: (string | undefined)[]): string {
    return classes.filter((c) => c != null).join(" ");
}

const inter = Inter({ subsets: ["latin"] });

interface DocsInfoVersioned {
    type: "versioned";
    versions: string[];
    activeVersion: string;
    activeNavigationConfig: FernRegistryDocsReadV1.UnversionedNavigationConfig;
}

interface DocsInfoUnversioned {
    type: "unversioned";
    activeNavigationConfig: FernRegistryDocsReadV1.UnversionedNavigationConfig;
}

export declare namespace Docs {
    export interface Props {
        docs: FernRegistryDocsReadV2.LoadDocsForUrlResponse;
        docsInfo: DocsInfoVersioned | DocsInfoUnversioned;
        resolvedUrlPath: ResolvedUrlPath;
        typographyStyleSheet?: string;
        nextPath: ResolvedUrlPath | null;
        previousPath: ResolvedUrlPath | null;
    }
}

function Typography({ stylesheet }: { stylesheet: string }) {
    return (
        // eslint-disable-next-line react/no-unknown-property
        <style id="fern-font-stylesheet" jsx global>
            {stylesheet}
        </style>
    );
}

export default function Docs({
    docs,
    docsInfo,
    typographyStyleSheet,
    resolvedUrlPath,
    nextPath,
    previousPath,
}: Docs.Props): JSX.Element {
    return (
        <>
            {typographyStyleSheet != null && <Typography stylesheet={typographyStyleSheet} />}
            <main className={classNames(inter.className, "typography-font-body")}>
                <Head>
                    {docs.definition.config.title != null && <title>{docs.definition.config.title}</title>}
                    {docs.definition.config.favicon != null && (
                        <link
                            rel="icon"
                            id="favicon"
                            href={docs.definition.files[docs.definition.config.favicon]}
                        ></link>
                    )}
                </Head>
                <App
                    docs={docs}
                    docsInfo={docsInfo}
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

    const { navigation: navigationConfig } = docs.body.definition.config;

    if (isVersionedNavigationConfig(navigationConfig)) {
        if (slug === "") {
            // TODO: The first element of the array is not necessarily the latest api version
            const [latestVersion] = navigationConfig.versions;
            if (latestVersion == null) {
                throw new Error("No versions found. This indicates a registration issue.");
            }

            const [firstNavigationItem] = latestVersion.config.items;
            if (firstNavigationItem != null) {
                slug = firstNavigationItem.urlSlug;

                const urlPathResolver = new UrlPathResolver({
                    navigation: latestVersion.config,
                    loadApiDefinition: (id) => docs.body.definition.apis[id],
                    loadApiPage: (id) => docs.body.definition.pages[id],
                });

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
                const [nextPath, previousPath] = await Promise.all([
                    urlPathResolver.getNextNavigatableItem(resolvedUrlPath),
                    urlPathResolver.getPreviousNavigatableItem(resolvedUrlPath),
                ]);

                return {
                    props: {
                        docs: docs.body,
                        docsInfo: {
                            type: "versioned",
                            activeVersion: latestVersion.version,
                            activeNavigationConfig: latestVersion.config,
                            versions: navigationConfig.versions.map(({ version: v }) => v),
                        },
                        typographyStyleSheet,
                        resolvedUrlPath,
                        nextPath: nextPath ?? null,
                        previousPath: previousPath ?? null,
                    },
                    revalidate: true,
                };
            } else {
                return { notFound: true, revalidate: true };
            }
        } else {
            // The slug must contain the version. If not, return not found

            const { version, rest } = extractVersionFromSlug(slug);
            if (version == null || version.length === 0) {
                return { notFound: true, revalidate: true };
            }
            slug = rest;

            // Find the version in docs definition
            const configData = navigationConfig.versions.find((c) => c.version === version);
            if (configData == null) {
                return { notFound: true, revalidate: true };
            }

            if (slug === "") {
                const [firstNavigationItem] = configData.config.items;
                if (firstNavigationItem != null) {
                    slug = firstNavigationItem.urlSlug;
                } else {
                    return { notFound: true, revalidate: true };
                }
            }

            const urlPathResolver = new UrlPathResolver({
                navigation: configData.config,
                loadApiDefinition: (id) => docs.body.definition.apis[id],
                loadApiPage: (id) => docs.body.definition.pages[id],
            });

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
            const [nextPath, previousPath] = await Promise.all([
                urlPathResolver.getNextNavigatableItem(resolvedUrlPath),
                urlPathResolver.getPreviousNavigatableItem(resolvedUrlPath),
            ]);

            return {
                props: {
                    docs: docs.body,
                    docsInfo: {
                        type: "versioned",
                        versions: navigationConfig.versions.map(({ version: v }) => v),
                        activeNavigationConfig: configData.config,
                        activeVersion: version,
                    },

                    activeVersion: version,
                    typographyStyleSheet,
                    resolvedUrlPath,
                    nextPath: nextPath ?? null,
                    previousPath: previousPath ?? null,
                },
                revalidate: true,
            };
        }
    } else {
        if (slug === "") {
            const [firstNavigationItem] = navigationConfig.items;
            if (firstNavigationItem != null) {
                slug = firstNavigationItem.urlSlug;
            } else {
                return { notFound: true, revalidate: true };
            }
        }

        const urlPathResolver = new UrlPathResolver({
            navigation: navigationConfig,
            loadApiDefinition: (id) => docs.body.definition.apis[id],
            loadApiPage: (id) => docs.body.definition.pages[id],
        });
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
        const [nextPath, previousPath] = await Promise.all([
            urlPathResolver.getNextNavigatableItem(resolvedUrlPath),
            urlPathResolver.getPreviousNavigatableItem(resolvedUrlPath),
        ]);

        return {
            props: {
                docs: docs.body,
                docsInfo: {
                    type: "unversioned",
                    activeNavigationConfig: navigationConfig,
                },
                typographyStyleSheet,
                resolvedUrlPath,
                nextPath: nextPath ?? null,
                previousPath: previousPath ?? null,
            },
            revalidate: true,
        };
    }
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

function extractVersionFromSlug(slug: string) {
    // TODO: Test this
    const [version, ...rest] = slug.split("/");
    return { version, rest: rest.join("/") };
}
