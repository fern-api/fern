import { type validateAgainstJsonSchema } from "@fern-api/core-utils";

export function formatNavigationConfigError({
    error,
    value,
    defaultMessage = "Failed to parse because JSON schema validation failed"
}: {
    error: validateAgainstJsonSchema.JsonSchemaError | undefined;
    value: unknown;
    defaultMessage?: string;
}): string {
    const message = error?.message ?? defaultMessage;
    const path = error?.instancePath ? ` at ${error.instancePath}` : "";
    const breadcrumb = error?.instancePath != null ? getNavigationBreadcrumb(value, error.instancePath) : undefined;
    return `${message}${path}${breadcrumb != null ? ` (${breadcrumb})` : ""}`;
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
        if (isRecord(current) && i > navigationIndex) {
            const label = getNavigationLabel(current);
            if (label != null && shouldIncludeLabelForSegment(segments[i - 1])) {
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

    if (breadcrumb.length === 0) {
        return undefined;
    }

    return `/${breadcrumb.join("/")}/`;
}

function shouldIncludeLabelForSegment(segment: string | undefined): boolean {
    return segment == null || /^\d+$/.test(segment);
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
