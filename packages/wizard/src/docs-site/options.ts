export type LayoutId = "layout-1" | "layout-2" | "layout-3";

export const LAYOUTS: { id: LayoutId; label: string; flag: string }[] = [
    { id: "layout-1", label: "Stacked", flag: "stacked" },
    { id: "layout-2", label: "Side by side", flag: "side-by-side" },
    { id: "layout-3", label: "Minimal", flag: "minimal" }
];

export type TypographyStyle = "classic" | "editorial" | "futuristic";
export type ButtonShape = "sharp" | "smooth" | "round";
export type DocsFeature = "api-reference" | "ask-fern" | "changelog";

export const TYPOGRAPHY_OPTIONS: {
    id: TypographyStyle;
    label: string;
    description: string;
    headingFont: string;
    bodyFont: string;
    headingSlug: string;
    bodySlug: string;
}[] = [
    {
        id: "classic",
        label: "Classic",
        description: "Clean and minimal",
        headingFont: "Inter",
        bodyFont: "Inter",
        headingSlug: "Inter",
        bodySlug: "Inter"
    },
    {
        id: "editorial",
        label: "Editorial",
        description: "Refined and expressive",
        headingFont: "Playfair Display",
        bodyFont: "Vollkorn",
        headingSlug: "Playfair+Display",
        bodySlug: "Vollkorn"
    },
    {
        id: "futuristic",
        label: "Futuristic",
        description: "Technical and precise",
        headingFont: "Space Grotesk",
        bodyFont: "Outfit",
        headingSlug: "Space+Grotesk",
        bodySlug: "Outfit"
    }
];

export const BUTTON_SHAPES: { id: ButtonShape; label: string; radius: string }[] = [
    { id: "sharp", label: "Sharp", radius: ".20rem" },
    { id: "smooth", label: "Smooth", radius: ".40rem" },
    { id: "round", label: "Round", radius: ".80rem" }
];

export const DOCS_FEATURES: { id: DocsFeature; label: string; description: string }[] = [
    { id: "api-reference", label: "API Reference", description: "Generate interactive API docs from your spec." },
    { id: "ask-fern", label: "Ask Fern", description: "AI-powered search and assistant for your docs." },
    { id: "changelog", label: "Changelog", description: "Record project changes with tags and RSS." }
];

export interface DocsSiteChoices {
    siteTitle: string;
    subdomain: string;
    layout: LayoutId;
    primaryColor?: string;
    logoPath?: string;
    typography?: TypographyStyle;
    buttonShape?: ButtonShape;
    features: DocsFeature[];
}

export function defaultDocsSiteChoices(org: string, layout?: LayoutId): DocsSiteChoices {
    return {
        siteTitle: org
            .toLowerCase()
            .split(/[-_]/)
            .map((word) => `${word.charAt(0).toUpperCase()}${word.slice(1)}`)
            .join(" "),
        subdomain: org.toLowerCase(),
        layout: layout ?? "layout-1",
        features: DOCS_FEATURES.map((feature) => feature.id)
    };
}

export function layoutFromFlag(flag: string | undefined): LayoutId | undefined {
    return LAYOUTS.find((layout) => layout.flag === flag)?.id;
}
