import {
    BUILD_USER_AGENT_METHOD_NAME,
    BUILD_USER_AGENT_RETURN_SUFFIX,
    buildUserAgentLocalLines,
    buildUserAgentReturnPrefix,
    getUserAgentProductName
} from "../buildUserAgentMethodBody.js";

describe("buildUserAgentMethodBody", () => {
    it("exposes the generated helper's method name", () => {
        expect(BUILD_USER_AGENT_METHOD_NAME).toBe("BuildUserAgent");
    });

    it("resolves the OS, architecture, and runtime version at runtime (not at generation time)", () => {
        const body = buildUserAgentLocalLines().join("\n");
        // OS/arch come from RuntimeInformation and the runtime version from
        // Environment.Version, so the values are computed on the running machine.
        expect(body).toContain("global::System.Runtime.InteropServices.RuntimeInformation.IsOSPlatform");
        expect(body).toContain("global::System.Runtime.InteropServices.RuntimeInformation.ProcessArchitecture");
        expect(body).toContain("global::System.Environment.Version.ToString()");
        // Lowercased OS/arch tokens per the Twilio shape.
        expect(body).toContain('? "windows"');
        expect(body).toContain('? "linux"');
        expect(body).toContain('? "osx"');
        expect(body).toContain("ToLowerInvariant()");
    });

    it("omits the OS/arch group when neither is known and degrades to a single value otherwise", () => {
        const body = buildUserAgentLocalLines().join("\n");
        // Both known -> "(os; arch)"; only one known -> "(os)" / "(arch)"; neither -> "".
        expect(body).toContain('$" ({os}; {arch})"');
        expect(body).toContain('$" ({os})"');
        expect(body).toContain('$" ({arch})"');
        expect(body).toContain('            : "";');
    });

    it("drops the runtime version when unavailable and never emits an empty runtime", () => {
        const body = buildUserAgentLocalLines().join("\n");
        // `dotnet` is used instead of `.NET`; a leading dot is not a valid RFC 7230 token character.
        expect(body).toContain('runtimeVersion.Length > 0 ? $" dotnet/{runtimeVersion}" : " dotnet"');
        expect(body).not.toContain(".NET");
    });

    it("normalizes the 64-bit x86 architecture aliases to the canonical x86_64", () => {
        const body = buildUserAgentLocalLines().join("\n");
        expect(body).toContain('arch = arch == "x64" || arch == "amd64" || arch == "x86_64" ? "x86_64" : arch;');
    });

    it("builds the Twilio-shaped User-Agent around the package name and version expression", () => {
        // The caller writes the version expression between the prefix and suffix,
        // yielding `{sdkName}/{sdkVersion} ({os}; {arch}) {runtime}/{runtimeVersion}`.
        const versionExpression = "Version.Current";
        const returnStatement =
            buildUserAgentReturnPrefix("Plantstore") + versionExpression + BUILD_USER_AGENT_RETURN_SUFFIX;
        expect(returnStatement).toBe('return $"Plantstore/{Version.Current}{platform}{runtime}";');
    });

    describe("getUserAgentProductName", () => {
        it("prefers the configured user-agent product name over the package id", () => {
            expect(
                getUserAgentProductName({ userAgentValue: "plantstore-internal/1.2.0", packageName: "Plantstore" })
            ).toBe("plantstore-internal");
        });

        it("treats a value without a version separator as the product name", () => {
            expect(getUserAgentProductName({ userAgentValue: "plantstore-internal", packageName: "Plantstore" })).toBe(
                "plantstore-internal"
            );
        });

        it("falls back to the package id when the IR has no user agent", () => {
            expect(getUserAgentProductName({ userAgentValue: undefined, packageName: "Plantstore" })).toBe(
                "Plantstore"
            );
        });
    });
});
