import { FernFiddle } from "@fern-fern/fiddle-sdk";
import { sanitizeForPypiLocalSegment } from "./computePreviewVersion.js";

export type PreviewLanguage = "npm" | "pypi";

export interface PreviewOutputModeArgs {
    registryUrl: string;
    /**
     * For npm: the npm package name (e.g. "@acme-preview/sdk").
     * For pypi: the PEP 503-normalized coordinate (e.g. "acme-preview-acme-sdk").
     */
    packageName: string;
    /**
     * For npm: the registry token used directly.
     * For pypi: the registry password (paired with username "__token__" by
     * convention - matches `convertGeneratorsConfiguration.ts` behavior).
     */
    token: string;
}

export interface PreviewStrategy {
    readonly language: PreviewLanguage;
    buildOutputMode(args: PreviewOutputModeArgs): FernFiddle.OutputMode;
    /**
     * Sanitizes a previewId for use in this language's version scheme.
     * For npm: passthrough (npm SemVer prerelease tolerates hyphens).
     * For pypi: collapses to dots, lowercases (PEP 440 local segment).
     */
    sanitizeForVersion(previewId: string): string;
}

export const npmPreviewStrategy: PreviewStrategy = {
    language: "npm",
    buildOutputMode({ registryUrl, packageName, token }) {
        return FernFiddle.OutputMode.publishV2(
            FernFiddle.remoteGen.PublishOutputModeV2.npmOverride({
                registryUrl,
                packageName,
                token,
                downloadSnippets: false
            })
        );
    },
    sanitizeForVersion(previewId) {
        return previewId;
    }
};

export const pypiPreviewStrategy: PreviewStrategy = {
    language: "pypi",
    buildOutputMode({ registryUrl, packageName, token }) {
        return FernFiddle.OutputMode.publishV2(
            FernFiddle.remoteGen.PublishOutputModeV2.pypiOverride({
                registryUrl,
                username: "__token__",
                password: token,
                coordinate: packageName,
                downloadSnippets: false,
                pypiMetadata: undefined
            })
        );
    },
    sanitizeForVersion(previewId) {
        return sanitizeForPypiLocalSegment(previewId);
    }
};

const NPM_GENERATOR_NAMES = new Set<string>([
    "fernapi/fern-typescript-node-sdk",
    "fernapi/fern-typescript-browser-sdk",
    "fernapi/fern-typescript-sdk"
]);

const PYPI_GENERATOR_NAMES = new Set<string>(["fernapi/fern-python-sdk"]);

/**
 * Returns the preview language for a generator name, or undefined if the
 * generator is not currently supported by `fern sdk preview`. Replaces the
 * old `isNpmGenerator` boolean check.
 */
export function getPreviewLanguage(generatorName: string): PreviewLanguage | undefined {
    if (NPM_GENERATOR_NAMES.has(generatorName)) {
        return "npm";
    }
    if (PYPI_GENERATOR_NAMES.has(generatorName)) {
        return "pypi";
    }
    return undefined;
}

export function getStrategy(language: PreviewLanguage): PreviewStrategy {
    return language === "npm" ? npmPreviewStrategy : pypiPreviewStrategy;
}
