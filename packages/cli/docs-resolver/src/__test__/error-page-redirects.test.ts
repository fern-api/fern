import { FernNavigation } from "@fern-api/fdr-sdk";

import { DocsDefinitionResolver } from "../DocsDefinitionResolver.js";

function withErrorPageRedirects(
    errorPageRedirects: { source: string; destination: string; permanent: boolean }[],
    authored: { source: string; destination: string }[] | undefined,
    root: object
): unknown {
    const resolver = Object.create(DocsDefinitionResolver.prototype) as DocsDefinitionResolver;
    Reflect.set(resolver, "errorPageRedirects", errorPageRedirects);
    const fn = Reflect.get(resolver, "withErrorPageRedirects") as (redirects: unknown, root: unknown) => unknown;
    return fn.call(resolver, authored, root);
}

function root(versions: { slug: string; default: boolean }[]): FernNavigation.V1.RootNode {
    return {
        type: "root",
        slug: "docs",
        child: {
            type: "versioned",
            children: versions.map(({ slug, default: isDefault }) => ({
                type: "version",
                slug,
                default: isDefault,
                child: { type: "unversioned", child: { type: "sidebarRoot", children: [] } }
            }))
        }
    } as unknown as FernNavigation.V1.RootNode;
}

const redirect = (source: string, destination: string) => ({ source, destination, permanent: false });

describe("error page redirects in the docs config", () => {
    it("keeps authored redirects as they are when there are no error page redirects", () => {
        const authored = [{ source: "/old", destination: "/new" }];
        expect(withErrorPageRedirects([], authored, root([]))).toBe(authored);
    });

    it("puts authored redirects first", () => {
        expect(
            withErrorPageRedirects(
                [redirect("/docs/api/errors/not-found-error", "/docs/api/get")],
                [{ source: "/old", destination: "/new" }],
                root([])
            )
        ).toEqual([
            { source: "/old", destination: "/new" },
            redirect("/docs/api/errors/not-found-error", "/docs/api/get")
        ]);
    });

    it("adds the unversioned URL for error pages under the default version only", () => {
        expect(
            withErrorPageRedirects(
                [
                    redirect("/docs/v2/api/errors/not-found-error", "/docs/v2/api/get"),
                    redirect("/docs/v1/api/errors/not-found-error", "/docs/v1/api/get")
                ],
                undefined,
                root([
                    { slug: "docs/v2", default: true },
                    { slug: "docs/v1", default: false }
                ])
            )
        ).toEqual([
            redirect("/docs/v2/api/errors/not-found-error", "/docs/v2/api/get"),
            redirect("/docs/v1/api/errors/not-found-error", "/docs/v1/api/get"),
            redirect("/docs/api/errors/not-found-error", "/docs/v2/api/get")
        ]);
    });
});
