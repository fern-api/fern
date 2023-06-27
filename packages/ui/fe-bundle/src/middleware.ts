import { assertNever } from "@fern-api/core-utils";
import { UrlSlugTree } from "@fern-api/ui";
import { LoadDocsForUrlResponse } from "@fern-fern/registry-browser/api/resources/docs/resources/v2/resources/read";
import { NextURL } from "next/dist/server/web/next-url";
import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";
import { getSlugFromUrl } from "./url-path-resolver/getSlugFromUrl";

// This function can be marked `async` if using `await` inside
export async function middleware(request: NextRequest): Promise<NextResponse> {
    const host = request.headers.get("x-fern-host") ?? request.nextUrl.hostname;

    const response = await fetch(
        (process.env.NEXT_PUBLIC_FDR_ORIGIN ?? "https://registry.buildwithfern.com") +
            "/v2/registry/docs/load-with-url",
        {
            method: "POST",
            body: JSON.stringify({
                url: process.env.NEXT_PUBLIC_DOCS_DOMAIN ?? `${host}${request.nextUrl.pathname}`,
            }),
            headers: {
                "Content-Type": "application/json",
            },
        }
    );
    const docs = (await response.json()) as LoadDocsForUrlResponse;

    const slug = getSlugFromUrl({
        pathname: request.nextUrl.pathname,
        docsBasePath: docs.baseUrl.basePath,
        docsDefinition: docs.definition,
    });
    if (slug == null) {
        return NextResponse.next();
    }

    const urlSlugTree = new UrlSlugTree(docs.definition);
    const resolvedSlug = urlSlugTree.resolveSlug(slug);
    if (resolvedSlug == null) {
        return NextResponse.next();
    }

    switch (resolvedSlug.type) {
        case "page":
        case "section":
            return NextResponse.next();
        case "api":
        case "apiSubpackage":
        case "clientLibraries":
        case "endpoint":
        case "topLevelEndpoint":
            return NextResponse.rewrite(new NextURL(`/${resolvedSlug.apiSlug}`, request.nextUrl.origin));
        default:
            assertNever(resolvedSlug);
    }
}

export const config = {
    matcher: [
        /*
         * Match all request paths except for the ones starting with:
         * - api (API routes)
         * - _next/static (static files)
         * - _next/image (image optimization files)
         * - favicon.ico (favicon file)
         */
        "/((?!_next/static|_next/image|favicon.ico).*)",
    ],
};
