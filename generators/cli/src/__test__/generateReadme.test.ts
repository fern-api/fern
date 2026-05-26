import { describe, expect, it } from "vitest";
import type { DetectedAuthBinding } from "../detectAuth.js";
import { renderReadme } from "../generateReadme.js";

describe("renderReadme", () => {
    const github = {
        repoUrl: "https://github.com/acme/acme-cli",
        version: "1.0.0"
    };

    it("renders a basic README with no auth bindings", () => {
        const result = renderReadme({
            binaryName: "acme",
            authBindings: [],
            github
        });

        expect(result).toContain("# acme");
        expect(result).toContain("A command-line interface for the acme API.");
        expect(result).toContain("cargo install --git https://github.com/acme/acme-cli");
        expect(result).toContain("acme --help");
        expect(result).toContain("releases page](https://github.com/acme/acme-cli/releases)");
        expect(result).not.toContain("## Authentication");
    });

    it("includes an authentication section for bearer auth", () => {
        const authBindings: DetectedAuthBinding[] = [
            {
                schemeName: "BearerAuth",
                rustCall: '.auth(BearerAuth::new("BearerAuth").env("ACME_TOKEN"))',
                placement: "root",
                authTypeImport: "BearerAuth"
            }
        ];

        const result = renderReadme({
            binaryName: "acme",
            authBindings,
            github
        });

        expect(result).toContain("## Authentication");
        expect(result).toContain("`ACME_TOKEN`");
        expect(result).toContain('export ACME_TOKEN="your-token"');
    });

    it("includes an authentication section for header (API key) auth", () => {
        const authBindings: DetectedAuthBinding[] = [
            {
                schemeName: "ApiKeyAuth",
                rustCall: '.auth(ApiKeyAuth::new("ApiKeyAuth").env("ACME_API_KEY"))',
                placement: "root",
                authTypeImport: "ApiKeyAuth"
            }
        ];

        const result = renderReadme({
            binaryName: "acme",
            authBindings,
            github
        });

        expect(result).toContain("`ACME_API_KEY`");
        expect(result).toContain('export ACME_API_KEY="your-token"');
    });

    it("includes an authentication section for basic auth with both credentials", () => {
        const authBindings: DetectedAuthBinding[] = [
            {
                schemeName: "BasicAuth",
                rustCall:
                    '.auth_basic_scheme("BasicAuth", AuthCredentialSource::from_env("ACME_USERNAME"), AuthCredentialSource::from_env("ACME_PASSWORD"))',
                placement: "binding",
                authTypeImport: "AuthCredentialSource"
            }
        ];

        const result = renderReadme({
            binaryName: "acme",
            authBindings,
            github
        });

        expect(result).toContain("`ACME_USERNAME`");
        expect(result).toContain("`ACME_PASSWORD`");
        expect(result).toContain('export ACME_USERNAME="your-token"');
    });

    it("includes an authentication section for basic auth with password omitted", () => {
        const authBindings: DetectedAuthBinding[] = [
            {
                schemeName: "ApiKeyAuth",
                rustCall:
                    '.auth_provider("ApiKeyAuth", BasicAuthProvider::username_only("ApiKeyAuth", AuthCredentialSource::from_env("CLOSE_API_KEY")))',
                placement: "binding",
                authTypeImport: "AuthCredentialSource, BasicAuthProvider"
            }
        ];

        const result = renderReadme({
            binaryName: "close",
            authBindings,
            github
        });

        expect(result).toContain("`CLOSE_API_KEY`");
        expect(result).toContain('export CLOSE_API_KEY="your-token"');
    });

    it("lists multiple auth bindings", () => {
        const authBindings: DetectedAuthBinding[] = [
            {
                schemeName: "ApiKeyAuth",
                rustCall:
                    '.auth_provider("ApiKeyAuth", BasicAuthProvider::username_only("ApiKeyAuth", AuthCredentialSource::from_env("CLOSE_API_KEY")))',
                placement: "binding",
                authTypeImport: "AuthCredentialSource, BasicAuthProvider"
            },
            {
                schemeName: "OAuth2",
                rustCall: '.auth(BearerAuth::new("OAuth2").env("CLOSE_TOKEN"))',
                placement: "root",
                authTypeImport: "BearerAuth"
            }
        ];

        const result = renderReadme({
            binaryName: "close",
            authBindings,
            github
        });

        expect(result).toContain("`CLOSE_API_KEY`");
        expect(result).toContain("`CLOSE_TOKEN`");
    });

    it("uses the binary name in the usage section", () => {
        const result = renderReadme({
            binaryName: "my-custom-cli",
            authBindings: [],
            github: { repoUrl: "https://github.com/org/my-custom-cli", version: "2.0.0" }
        });

        expect(result).toContain("# my-custom-cli");
        expect(result).toContain("my-custom-cli --help");
        expect(result).toContain("cargo install --git https://github.com/org/my-custom-cli");
    });
});
