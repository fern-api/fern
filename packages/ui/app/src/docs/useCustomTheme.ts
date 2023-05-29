import * as FernRegistryDocsRead from "@fern-fern/registry-browser/api/resources/docs/resources/v1/resources/read";
import { useEffect } from "react";

const DEFAULT_ACCENT_PRIMARY: FernRegistryDocsRead.RgbColor = {
    r: 129,
    g: 140,
    b: 248,
};

const CSS_VARIABLES = {
    ACCENT_PRIMARY: "--accent-primary",
} as const;

// eslint-disable-next-line @typescript-eslint/no-non-null-assertion
const root = document.querySelector<HTMLElement>(":root")!;

export function useCustomTheme(docsDefinition: FernRegistryDocsRead.DocsDefinition): void {
    useEffect(() => {
        const accentPrimary = docsDefinition.config.colors?.accentPrimary ?? DEFAULT_ACCENT_PRIMARY;
        root.style.setProperty(
            CSS_VARIABLES.ACCENT_PRIMARY,
            `${accentPrimary.r}, ${accentPrimary.g}, ${accentPrimary.b}`
        );
    }, [docsDefinition.config.colors?.accentPrimary]);
}
