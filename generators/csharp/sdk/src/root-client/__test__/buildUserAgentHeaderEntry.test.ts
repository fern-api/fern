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
    it("emits the IR-supplied header and value when `userAgent` is set, regardless of `userAgentFromPackage`", () => {
        // Mirrors the Fern Definition path where `sdkConfig.platformHeaders.userAgent`
        // is always populated, so the generator should pass it through verbatim
        // even when the new opt-in flag is off.
        const entry = buildUserAgentHeaderEntry({
            userAgent: { header: "User-Agent", value: "MyClient/1.2.3" },
            packageName: "Plantstore",
            csharp: generation.csharp,
            versionValueAccess: fakeVersionAccess(),
            userAgentFromPackage: false
        });

        if (entry == null) {
            throw new Error("Expected entry to be defined when `userAgent` is set.");
        }
        expect(render(entry.key)).toBe('"User-Agent"');
        expect(render(entry.value)).toBe('"MyClient/1.2.3"');
    });

    it("returns `undefined` when `userAgent` is unset and `userAgentFromPackage` is false", () => {
        // Default behavior for OpenAPI imports: the generator must emit no
        // User-Agent entry at all so the generated SDK matches the pre-flag
        // baseline. Returning `undefined` lets the caller skip the push.
        const entry = buildUserAgentHeaderEntry({
            userAgent: undefined,
            packageName: "Plantstore",
            csharp: generation.csharp,
            versionValueAccess: fakeVersionAccess(),
            userAgentFromPackage: false
        });

        expect(entry).toBeUndefined();
    });

    it("falls back to `<packageName>/{Version.Current}` when `userAgent` is undefined and the flag is on", () => {
        // Opt-in parity with the TypeScript generator's
        // `<npm-package-name>/<version>` fallback: only emitted when the user
        // has explicitly enabled `user-agent-from-package`.
        const entry = buildUserAgentHeaderEntry({
            userAgent: undefined,
            packageName: "Plantstore",
            csharp: generation.csharp,
            versionValueAccess: fakeVersionAccess(),
            userAgentFromPackage: true
        });

        if (entry == null) {
            throw new Error("Expected entry to be defined when `userAgentFromPackage` is true.");
        }
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
            versionValueAccess: fakeVersionAccess(),
            userAgentFromPackage: true
        });

        if (entry == null) {
            throw new Error("Expected entry to be defined when `userAgentFromPackage` is true.");
        }
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
            }),
            userAgentFromPackage: true
        });

        if (entry == null) {
            throw new Error("Expected entry to be defined when `userAgentFromPackage` is true.");
        }
        expect(render(entry.value)).toBe('$"pkg/{MyVersionType.Current}"');
    });
});
