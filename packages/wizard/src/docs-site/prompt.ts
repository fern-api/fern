import { access, stat } from "fs/promises";
import inquirer from "inquirer";
import path from "path";
import {
    BUTTON_SHAPES,
    type ButtonShape,
    DOCS_FEATURES,
    type DocsFeature,
    type DocsSiteChoices,
    LAYOUTS,
    type LayoutId,
    TYPOGRAPHY_OPTIONS,
    type TypographyStyle
} from "./options";

interface SiteTitleAnswer {
    siteTitle: string;
}

interface SubdomainAnswer {
    subdomain: string;
}

interface LayoutAnswer {
    layout: LayoutId;
}

interface PrimaryColorAnswer {
    primaryColor: string;
}

interface LogoAnswer {
    logoPath: string;
}

interface TypographyAnswer {
    typography: TypographyStyle | undefined;
}

interface ButtonShapeAnswer {
    buttonShape: ButtonShape | undefined;
}

interface FeaturesAnswer {
    features: DocsFeature[];
}

export async function promptDocsSiteChoices(
    defaults: DocsSiteChoices,
    baseDir: string = process.cwd()
): Promise<DocsSiteChoices> {
    const title = await inquirer.prompt<SiteTitleAnswer>([
        {
            type: "input",
            name: "siteTitle",
            message: "Site title",
            default: defaults.siteTitle,
            validate: (input: string) => input.trim().length > 0 || "Site title is required."
        }
    ]);
    const url = await inquirer.prompt<SubdomainAnswer>([
        {
            type: "input",
            name: "subdomain",
            message: `Docs URL (${defaults.subdomain}.docs.buildwithfern.com)`,
            default: defaults.subdomain,
            validate: (input: string) =>
                /^[a-z0-9]([a-z0-9-]*[a-z0-9])?$/.test(input) || "Use lowercase letters, numbers, and hyphens."
        }
    ]);
    const layout = await inquirer.prompt<LayoutAnswer>([
        {
            type: "list",
            name: "layout",
            message: "Landing page layout",
            choices: LAYOUTS.map((option) => ({ name: option.label, value: option.id })),
            default: defaults.layout
        }
    ]);
    const color = await inquirer.prompt<PrimaryColorAnswer>([
        {
            type: "input",
            name: "primaryColor",
            message: "Primary color (hex, blank to keep the starter's green)",
            default: defaults.primaryColor,
            validate: (input: string) =>
                input.trim().length === 0 || /^#?[0-9a-fA-F]{6}$/.test(input.trim()) || "Enter a six-digit hex color."
        }
    ]);
    const logo = await inquirer.prompt<LogoAnswer>([
        {
            type: "input",
            name: "logoPath",
            message: "Logo file (blank to keep the starter logo)",
            default: defaults.logoPath,
            validate: async (input: string) => {
                const trimmed = input.trim();
                if (trimmed.length === 0) {
                    return true;
                }
                try {
                    const logoPath = path.resolve(baseDir, trimmed);
                    await access(logoPath);
                    return (await stat(logoPath)).isFile() || "Logo path must point to a file.";
                } catch {
                    return "Logo file does not exist.";
                }
            }
        }
    ]);
    const typography = await inquirer.prompt<TypographyAnswer>([
        {
            type: "list",
            name: "typography",
            message: "Font style",
            choices: [
                { name: "Keep starter default", value: undefined },
                ...TYPOGRAPHY_OPTIONS.map((option) => ({
                    name: `${option.label} — ${option.description}`,
                    value: option.id
                }))
            ],
            default: defaults.typography
        }
    ]);
    const buttonShape = await inquirer.prompt<ButtonShapeAnswer>([
        {
            type: "list",
            name: "buttonShape",
            message: "Button shape",
            choices: [
                { name: "Keep starter default", value: undefined },
                ...BUTTON_SHAPES.map((option) => ({ name: option.label, value: option.id }))
            ],
            default: defaults.buttonShape
        }
    ]);
    const features = await inquirer.prompt<FeaturesAnswer>([
        {
            type: "checkbox",
            name: "features",
            message: "Features",
            choices: [
                ...DOCS_FEATURES.map((feature) => ({
                    name: `${feature.label} — ${feature.description}`,
                    value: feature.id,
                    checked: defaults.features.includes(feature.id)
                })),
                {
                    name: "Password protection — Require a password to access your docs site.",
                    value: "password-protection",
                    disabled: "set up in the Dashboard after you publish"
                }
            ]
        }
    ]);

    const primaryColor = color.primaryColor.trim();
    const logoPath = logo.logoPath.trim();
    return {
        siteTitle: title.siteTitle.trim(),
        subdomain: url.subdomain.trim(),
        layout: layout.layout,
        ...(primaryColor.length > 0 ? { primaryColor: `#${primaryColor.replace(/^#/, "").toLowerCase()}` } : {}),
        ...(logoPath.length > 0 ? { logoPath } : {}),
        ...(typography.typography === undefined ? {} : { typography: typography.typography }),
        ...(buttonShape.buttonShape === undefined ? {} : { buttonShape: buttonShape.buttonShape }),
        features: features.features
    };
}
