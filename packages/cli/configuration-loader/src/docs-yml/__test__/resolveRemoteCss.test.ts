import { afterEach, describe, expect, it, vi } from "vitest";

import { isRemoteCssUrl, resolveRemoteCss } from "../resolveRemoteCss.js";

function mockFetch(files: Record<string, string>): void {
    vi.stubGlobal(
        "fetch",
        vi.fn(async (url: string) => {
            const body = files[url];
            return body == null
                ? new Response("not found", { status: 404, statusText: "Not Found" })
                : new Response(body, { status: 200 });
        })
    );
}

describe("resolveRemoteCss", () => {
    afterEach(() => {
        vi.unstubAllGlobals();
    });

    it("detects http(s) URLs only", () => {
        expect(isRemoteCssUrl("https://cdn.example.com/a.css")).toBe(true);
        expect(isRemoteCssUrl("http://cdn.example.com/a.css")).toBe(true);
        expect(isRemoteCssUrl("styles/a.css")).toBe(false);
        expect(isRemoteCssUrl("./https.css")).toBe(false);
        expect(isRemoteCssUrl("C:\\styles\\a.css")).toBe(false);
    });

    it("rewrites relative url() references against the stylesheet URL", async () => {
        mockFetch({
            "https://cdn.example.com/pkg/dist/style.css": [
                "@font-face { src: url('../fonts/a.woff2') format('woff2'); }",
                ".a { background: url(img/bg.png); }",
                '.b { background: url("/root.png"); }',
                ".c { background: url(https://other.example.com/x.png); }",
                ".d { background: url(data:image/png;base64,AAAA); }",
                ".e { background: url(//proto.example.com/y.png); }"
            ].join("\n")
        });
        const css = await resolveRemoteCss("https://cdn.example.com/pkg/dist/style.css");
        expect(css).toContain("url('https://cdn.example.com/pkg/fonts/a.woff2')");
        expect(css).toContain("url(https://cdn.example.com/pkg/dist/img/bg.png)");
        expect(css).toContain('url("https://cdn.example.com/root.png")');
        expect(css).toContain("url(https://other.example.com/x.png)");
        expect(css).toContain("url(data:image/png;base64,AAAA)");
        expect(css).toContain("url(https://proto.example.com/y.png)");
    });

    it("inlines nested @imports, wrapping media-conditioned ones", async () => {
        mockFetch({
            "https://cdn.example.com/main.css":
                '@import "./base.css";\n@import url(print.css) print;\n.main { color: red; }',
            "https://cdn.example.com/base.css": ".base { background: url(bg.png); }",
            "https://cdn.example.com/print.css": ".print { display: none; }"
        });
        const css = await resolveRemoteCss("https://cdn.example.com/main.css");
        expect(css).not.toContain("@import");
        expect(css).toContain(".base { background: url(https://cdn.example.com/bg.png); }");
        expect(css).toContain("@media print {\n.print { display: none; }\n}");
        expect(css).toContain(".main { color: red; }");
    });

    it("does not loop on circular imports", async () => {
        mockFetch({
            "https://cdn.example.com/a.css": '@import "b.css";\n.a {}',
            "https://cdn.example.com/b.css": '@import "a.css";\n.b {}'
        });
        const css = await resolveRemoteCss("https://cdn.example.com/a.css");
        expect(css).toContain(".a {}");
        expect(css).toContain(".b {}");
    });

    it("throws a descriptive error when the stylesheet cannot be fetched", async () => {
        mockFetch({});
        await expect(resolveRemoteCss("https://cdn.example.com/missing.css")).rejects.toThrow(
            "Failed to fetch CSS from https://cdn.example.com/missing.css: 404 Not Found"
        );
    });
});
