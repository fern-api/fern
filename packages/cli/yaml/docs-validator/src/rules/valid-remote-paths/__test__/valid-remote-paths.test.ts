import { docsYml } from "@fern-api/configuration";
import { describe, expect, it } from "vitest";

import { siteHosts, ValidRemotePathsRule } from "../valid-remote-paths.js";

const ui = (destination: string, path = "/ui") => [{ path, destination }];

describe("remotePathProblems", () => {
    it("accepts a public https destination", () => {
        expect(docsYml.remotePathProblems(ui("https://portal.fernwood.example/ui"))).toEqual([]);
        expect(docsYml.remotePathProblems(ui("https://portal.fernwood.example"))).toEqual([]);
    });

    it.each([
        "/",
        "ui",
        "/ui/",
        "/ui/../x",
        "/api/fern-docs",
        "/API/Fern-Docs",
        "/_fern-files/x",
        "/api",
        "/.well-known"
    ])("rejects path %j", (path) => {
        expect(docsYml.remotePathProblems(ui("https://portal.fernwood.example", path))).not.toEqual([]);
    });

    it.each([
        "http://portal.fernwood.example",
        "https://user:pw@portal.fernwood.example",
        "https://portal.fernwood.example?x=1",
        "https://portal.fernwood.example:8443",
        "https://10.0.0.1",
        "https://127.1",
        "https://[::1]",
        "https://localhost",
        "https://intranet",
        "https://svc.internal",
        "https://acme.docs.buildwithfern.com",
        "https://cname.ferndocs.com"
    ])("rejects destination %j", (destination) => {
        expect(docsYml.remotePathProblems(ui(destination))).not.toEqual([]);
    });

    it("rejects the site's own hosts", () => {
        expect(
            docsYml.remotePathProblems(ui("https://developer.fernwood.example/app"), ["developer.fernwood.example"])
        ).not.toEqual([]);
    });

    it("rejects duplicate and nested mounts", () => {
        const destination = "https://portal.fernwood.example";
        expect(
            docsYml.remotePathProblems([
                { path: "/ui", destination },
                { path: "/ui", destination }
            ])
        ).not.toEqual([]);
        expect(
            docsYml.remotePathProblems([
                { path: "/ui", destination },
                { path: "/ui/admin", destination }
            ])
        ).not.toEqual([]);
    });
});

describe("siteHosts", () => {
    it("collects instance URLs and custom domains", () => {
        const config = {
            instances: [
                { url: "fernwood.docs.buildwithfern.com/learn", customDomain: "developer.fernwood.example/learn" },
                { url: "https://moss.docs.buildwithfern.com", customDomain: ["a.moss.example", "b.moss.example"] }
            ]
        } as unknown as docsYml.RawSchemas.DocsConfiguration;
        expect(siteHosts(config)).toEqual([
            "fernwood.docs.buildwithfern.com",
            "developer.fernwood.example",
            "moss.docs.buildwithfern.com",
            "a.moss.example",
            "b.moss.example"
        ]);
    });
});

describe("ValidRemotePathsRule", () => {
    const run = async (remotePaths: unknown) => {
        const { redirects: _redirects, ...config } = docsYml.RawSchemas.Serializer.DocsConfiguration.parseOrThrow({
            instances: [{ url: "fernwood.docs.buildwithfern.com" }],
            "remote-paths": remotePaths
        });
        const visitor = await ValidRemotePathsRule.create({} as never);
        return visitor.file?.({ config });
    };

    it("reads `remote-paths` from a parsed docs.yml", async () => {
        expect(await run([{ path: "/ui", destination: "https://portal.fernwood.example/ui" }])).toEqual([]);
        expect(await run([{ path: "/_astro", destination: "http://localhost" }])).toEqual([
            expect.objectContaining({ severity: "fatal" }),
            expect.objectContaining({ severity: "fatal" })
        ]);
    });
});
