import { type validateAgainstJsonSchema } from "./validateAgainstJsonSchema.js";

export function formatNavigationConfigError({
    error,
    value,
    defaultMessage = "Unknown error"
}: {
    error: validateAgainstJsonSchema.JsonSchemaError | undefined;
    value: unknown;
    defaultMessage?: string;
}): string {
    const message = error?.message ?? defaultMessage;
    const breadcrumb = error?.instancePath != null ? getNavigationBreadcrumb(value, error.instancePath) : undefined;
    return `${message}${breadcrumb != null ? ` (${breadcrumb})` : ""}`;
}

function getNavigationBreadcrumb(value: unknown, instancePath: string): string | undefined {
    const segments = parseJsonPointer(instancePath);
    const navigationIndex = segments.indexOf("navigation");
    if (navigationIndex === -1) {
        return undefined;
    }

    const breadcrumb: string[] = [];
    let current: unknown = value;

    for (let i = 0; i < segments.length; i++) {
        const segment = segments[i];
        if (segment == null) {
            continue;
        }
        const previousSegment = segments[i - 1];
        if (isRecord(current) && i > navigationIndex && previousSegment != null && /^\d+$/.test(previousSegment)) {
            const label = getNavigationLabel(current);
            if (label != null) {
                breadcrumb.push(label);
            }
        }

        current = getChild(current, segment);
    }

    if (isRecord(current)) {
        const label = getNavigationLabel(current);
        if (label != null) {
            breadcrumb.push(label);
        }
    }

    return breadcrumb.length > 0 ? `/${breadcrumb.join("/")}/` : undefined;
}

function parseJsonPointer(instancePath: string): string[] {
    return instancePath
        .split("/")
        .filter((part) => part.length > 0)
        .map((part) => part.replace(/~1/g, "/").replace(/~0/g, "~"));
}

function getChild(value: unknown, segment: string): unknown {
    if (Array.isArray(value) && /^\d+$/.test(segment)) {
        return value[Number(segment)];
    }
    if (isRecord(value)) {
        return value[segment];
    }
    return undefined;
}

function getNavigationLabel(value: Record<string, unknown>): string | undefined {
    for (const key of ["tab", "section", "page", "title", "api", "changelog", "link"]) {
        const label = value[key];
        if (typeof label === "string" && label.length > 0) {
            return label;
        }
    }
    return undefined;
}

function isRecord(value: unknown): value is Record<string, unknown> {
    return typeof value === "object" && value != null && !Array.isArray(value);
}
