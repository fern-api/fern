import { afterEach, describe, expect, it, vi } from "vitest";

import {
    applyDocsSubstitutions,
    createDocsSubstitutionSource,
    createPageSubstituter,
    hasDocsSubstitutions
} from "../substitutions.js";

const ENV_NAME = "FERN_TEST_DOCS_SUBSTITUTION";

describe("docs.yml substitutions", () => {
    afterEach(() => {
        delete process.env[ENV_NAME];
    });

    it("reports whether any substitution source is configured", () => {
        expect(hasDocsSubstitutions({})).toBe(false);
        expect(hasDocsSubstitutions({ settings: { substituteEnvVars: false } })).toBe(false);
        expect(hasDocsSubstitutions({ settings: { substituteEnvVars: true } })).toBe(true);
        expect(hasDocsSubstitutions({ substitutions: { version: "v1" } })).toBe(true);
    });

    it("returns content unchanged when nothing is configured", () => {
        const onError = vi.fn();
        const content = { title: "Release ${version}" };
        expect(applyDocsSubstitutions({}, content, { onError })).toBe(content);
        expect(onError).not.toHaveBeenCalled();
    });

    it("substitutes explicit values, including inside code blocks", () => {
        const onError = vi.fn();
        const page = [
            "# GPU Operator ${minor_version}",
            "```bash",
            "helm install gpu-operator --version=${version}",
            "echo \\$\\{HOME\\}",
            "```"
        ].join("\n");

        const substituted = applyDocsSubstitutions(
            { substitutions: { version: "v26.7.0", minor_version: "26.7" } },
            { title: "GPU Operator ${minor_version}", pages: { "index.mdx": page } },
            { onError }
        );

        expect(onError).not.toHaveBeenCalled();
        expect(substituted).toEqual({
            title: "GPU Operator 26.7",
            pages: {
                "index.mdx": [
                    "# GPU Operator 26.7",
                    "```bash",
                    "helm install gpu-operator --version=v26.7.0",
                    "echo ${HOME}",
                    "```"
                ].join("\n")
            }
        });
    });

    it("does not read the environment unless substitute-env-vars is enabled", () => {
        process.env[ENV_NAME] = "from-env";
        const onError = vi.fn();

        const substituted = applyDocsSubstitutions(
            { substitutions: { version: "v1" } },
            `\${version} \${${ENV_NAME}}`,
            { onError }
        );

        expect(substituted).toBe("v1 ");
        expect(onError).toHaveBeenCalledWith(`Substitution ${ENV_NAME} is not defined in docs.yml substitutions.`);
    });

    it("prefers explicit substitutions over the environment", () => {
        process.env[ENV_NAME] = "from-env";
        const source = createDocsSubstitutionSource({
            settings: { substituteEnvVars: true },
            substitutions: { [ENV_NAME]: "from-docs-yml", other: "x" }
        });

        expect(source(ENV_NAME)).toBe("from-docs-yml");
        expect(source("other")).toBe("x");
        expect(source("missing")).toBeUndefined();
    });

    it("falls back to the environment when substitute-env-vars is enabled", () => {
        process.env[ENV_NAME] = "from-env";
        const onError = vi.fn();

        const substituted = applyDocsSubstitutions(
            { settings: { substituteEnvVars: true }, substitutions: { version: "v1" } },
            `\${version} \${${ENV_NAME}} \${missing}`,
            { onError }
        );

        expect(substituted).toBe("v1 from-env ");
        expect(onError).toHaveBeenCalledWith(
            "Substitution missing is not defined in docs.yml substitutions or the environment."
        );
    });

    it("keeps the legacy error message for environment-only configurations", () => {
        const onError = vi.fn();
        applyDocsSubstitutions({ settings: { substituteEnvVars: true } }, "${missing}", { onError });
        expect(onError).toHaveBeenCalledWith("Environment variable missing is not defined.");
    });

    it("blanks undefined names in preview mode when the environment is not consulted", () => {
        const onError = vi.fn();
        const substituted = applyDocsSubstitutions(
            { substitutions: { version: "v1" } },
            "${version} ${missing}",
            { onError },
            { preview: true }
        );
        expect(substituted).toBe("v1 ");
        expect(onError).not.toHaveBeenCalled();
    });

    it("still reports undefined names in preview mode when the environment is consulted", () => {
        const onError = vi.fn();
        const substituted = applyDocsSubstitutions(
            { settings: { substituteEnvVars: true } },
            "${missing}",
            { onError },
            { preview: true }
        );
        expect(substituted).toBe("");
        expect(onError).toHaveBeenCalledTimes(1);
    });

    describe("page substituter", () => {
        const page = "Release ${version} of ${product}, escaped \\$\\{HOME\\}";

        it("resolves the version file ahead of docs.yml in a single pass", () => {
            const onError = vi.fn();

            const result = createPageSubstituter(
                { versionFile: { version: "v1.0.0" }, docsConfig: undefined, ref: undefined },
                { substitutions: { version: "v2.0.0", product: "Widget" } },
                { onError }
            )(page);

            expect(onError).not.toHaveBeenCalled();
            expect(result).toEqual("Release v1.0.0 of Widget, escaped ${HOME}");
        });

        it("resolves a page outside any version against docs.yml alone", () => {
            const onError = vi.fn();

            const result = createPageSubstituter(
                undefined,
                { substitutions: { version: "v2.0.0", product: "Widget" } },
                { onError }
            )(page);

            expect(onError).not.toHaveBeenCalled();
            expect(result).toEqual("Release v2.0.0 of Widget, escaped ${HOME}");
        });

        it("returns content unchanged when no source is configured", () => {
            const onError = vi.fn();
            expect(createPageSubstituter(undefined, {}, { onError })(page)).toBe(page);
            expect(
                createPageSubstituter(
                    { versionFile: undefined, docsConfig: undefined, ref: undefined },
                    {},
                    { onError }
                )(page)
            ).toBe(page);
            expect(onError).not.toHaveBeenCalled();
        });

        it("fails on names defined in neither the version file nor docs.yml", () => {
            const onError = vi.fn();

            const result = createPageSubstituter(
                { versionFile: { version: "v1.0.0" }, docsConfig: undefined, ref: undefined },
                {},
                { onError }
            )(page);

            expect(onError).toHaveBeenCalledWith(
                "Substitution product is not defined in the version file or docs.yml."
            );
            expect(result).toEqual("Release v1.0.0 of , escaped ${HOME}");
        });

        it("falls back to the environment last when docs.yml enables it", () => {
            const onError = vi.fn();
            process.env[ENV_NAME] = "from-env";

            const result = createPageSubstituter(
                { versionFile: { version: "v1.0.0" }, docsConfig: undefined, ref: undefined },
                { substitutions: { product: "Widget" }, settings: { substituteEnvVars: true } },
                { onError }
            )(`${page} \${${ENV_NAME}} \${missing}`);

            expect(result).toEqual("Release v1.0.0 of Widget, escaped ${HOME} from-env ");
            expect(onError).toHaveBeenCalledWith(
                "Substitution missing is not defined in the version file or docs.yml or the environment."
            );
        });

        it("resolves a ref-backed version against the ref's version file and docs.yml only", () => {
            const onError = vi.fn();
            process.env[ENV_NAME] = "from-env";

            const result = createPageSubstituter(
                {
                    versionFile: { version: "v1.0.0" },
                    docsConfig: {
                        substitutions: { version: "wrong", product: "Widget" },
                        settings: { substituteEnvVars: true }
                    },
                    ref: "v1.0.0"
                },
                { substitutions: { version: "v2.0.0", product: "Gadget", missing: "current-branch" } },
                { onError }
            )(`${page} \${${ENV_NAME}} \${missing}`);

            expect(result).toEqual("Release v1.0.0 of Widget, escaped ${HOME} from-env ");
            expect(onError).toHaveBeenCalledWith(
                "Substitution missing is not defined in the version file or docs.yml at git ref 'v1.0.0' or the environment."
            );
        });

        it("does not fall back to the environment for a ref whose docs.yml does not enable it", () => {
            const onError = vi.fn();
            process.env[ENV_NAME] = "from-env";

            createPageSubstituter(
                { versionFile: undefined, docsConfig: { substitutions: {} }, ref: "v1.0.0" },
                { settings: { substituteEnvVars: true } },
                { onError }
            )(`\${${ENV_NAME}}`);

            expect(onError).toHaveBeenCalledWith(
                `Substitution ${ENV_NAME} is not defined in the version file or docs.yml at git ref 'v1.0.0'.`
            );
        });

        it("resolves undefined names to empty strings in preview mode", () => {
            const onError = vi.fn();

            const result = createPageSubstituter(
                { versionFile: { version: "v1.0.0" }, docsConfig: undefined, ref: undefined },
                {},
                { onError },
                { preview: true }
            )(page);

            expect(onError).not.toHaveBeenCalled();
            expect(result).toEqual("Release v1.0.0 of , escaped ${HOME}");
        });
    });
});
