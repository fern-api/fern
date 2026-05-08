import { ast, CsharpConfigSchema, Generation } from "@fern-api/csharp-codegen";
import { FernIr } from "@fern-fern/ir-sdk";

import { buildUserAgentHeaderEntry } from "../buildUserAgentHeaderEntry.js";

type IntermediateRepresentation = FernIr.IntermediateRepresentation;

const generation = new Generation({} as unknown as IntermediateRepresentation, "", {} as CsharpConfigSchema, {
    dryRun: false,
    irFilepath: "",
    organization: "",
    workspaceName: ""
});

function render(node: ast.AstNode): string {
    return node.toString({
        namespace: "",
        allNamespaceSegments: new Set<string>(),
        allTypeClassReferences: new Map<string, Set<string>>(),
        generation
    });
}

// Stand-in for `context.getCurrentVersionValueAccess()`. The real codeblock writes
// `Version.Current` (and emits a using directive); for unit-testing the helper's
// composition with the version expression, a literal codeblock is sufficient.
function fakeVersionAccess(): ast.CodeBlock {
    return generation.csharp.codeblock("Version.Current");
}

describe("buildUserAgentHeaderEntry", () => {
    it("emits the IR-supplied header and value when `userAgent` is set", () => {
        // Mirrors the Fern Definition path where `sdkConfig.platformHeaders.userAgent`
        // is always populated, so the generator should pass it through verbatim.
        const entry = buildUserAgentHeaderEntry({
            userAgent: { header: "User-Agent", value: "MyClient/1.2.3" },
            packageName: "Plantstore",
            csharp: generation.csharp,
            versionValueAccess: fakeVersionAccess()
        });

        expect(render(entry.key)).toBe('"User-Agent"');
        expect(render(entry.value)).toBe('"MyClient/1.2.3"');
    });

    it("falls back to `<packageName>/{Version.Current}` when `userAgent` is undefined", () => {
        // OpenAPI imports never set `platformHeaders.userAgent`, so the generator
        // must synthesize a User-Agent from the NuGet package id and the static
        // `Version.Current` expression — matching the TS generator's
        // `<npm-package-name>/<version>` fallback.
        const entry = buildUserAgentHeaderEntry({
            userAgent: undefined,
            packageName: "Plantstore",
            csharp: generation.csharp,
            versionValueAccess: fakeVersionAccess()
        });

        expect(render(entry.key)).toBe('"User-Agent"');
        expect(render(entry.value)).toBe('$"Plantstore/{Version.Current}"');
    });

    it("preserves dotted NuGet package ids verbatim in the fallback", () => {
        // NuGet package ids canonically use `.` segments (e.g. `DocuSign.eSign`),
        // so the helper must not normalize or escape them.
        const entry = buildUserAgentHeaderEntry({
            userAgent: undefined,
            packageName: "DocuSign.eSign",
            csharp: generation.csharp,
            versionValueAccess: fakeVersionAccess()
        });

        expect(render(entry.value)).toBe('$"DocuSign.eSign/{Version.Current}"');
    });

    it("interpolates the version value access without re-quoting the prefix", () => {
        // Regression guard: the helper builds the value via a writer callback so
        // the version sub-expression is emitted as code, not as a string literal.
        // The output must be a single `$"..."`-style interpolated string with the
        // version inside `{...}` braces.
        const entry = buildUserAgentHeaderEntry({
            userAgent: undefined,
            packageName: "pkg",
            csharp: generation.csharp,
            versionValueAccess: generation.csharp.codeblock((writer) => {
                writer.write("MyVersionType.Current");
            })
        });

        expect(render(entry.value)).toBe('$"pkg/{MyVersionType.Current}"');
    });
});
