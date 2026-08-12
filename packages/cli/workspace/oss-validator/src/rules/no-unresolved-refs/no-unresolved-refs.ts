import { AbsoluteFilePath, dirname, doesPathExistSync, relative, resolve } from "@fern-api/fs-utils";

import { Rule } from "../../Rule";
import { ValidationViolation } from "../../ValidationViolation";

interface UnresolvedRef {
    ref: string;
    nodePath: string[];
    reason: string;
}

const MAX_VIOLATIONS_PER_SPEC = 25;

export const NoUnresolvedRefsRule: Rule = {
    name: "no-unresolved-refs",
    run: async ({ workspace, specs, loadedDocuments }) => {
        const violations: ValidationViolation[] = [];

        for (const spec of specs) {
            if (spec.type !== "openapi") {
                continue;
            }
            const document = loadedDocuments.get(spec.absoluteFilepath);
            if (document == null) {
                continue;
            }

            const relativeFilepath = relative(workspace.absoluteFilePath, spec.source.file);
            const specDirectory = dirname(spec.absoluteFilepath);

            const unresolved = collectUnresolvedRefs({ document, specDirectory });
            for (const { ref, nodePath, reason } of unresolved.slice(0, MAX_VIOLATIONS_PER_SPEC)) {
                violations.push({
                    name: "no-unresolved-refs",
                    severity: "error",
                    relativeFilepath,
                    nodePath,
                    message: `Unresolved $ref "${ref}" at ${nodePath.join(".")}: ${reason}`
                });
            }
            if (unresolved.length > MAX_VIOLATIONS_PER_SPEC) {
                violations.push({
                    name: "no-unresolved-refs",
                    severity: "error",
                    relativeFilepath,
                    nodePath: [],
                    message: `${unresolved.length - MAX_VIOLATIONS_PER_SPEC} additional unresolved $refs were found in this specification.`
                });
            }
        }

        return violations;
    }
};

function collectUnresolvedRefs({
    document,
    specDirectory
}: {
    document: object;
    specDirectory: AbsoluteFilePath;
}): UnresolvedRef[] {
    const unresolved: UnresolvedRef[] = [];

    const visit = (node: unknown, nodePath: string[]): void => {
        if (Array.isArray(node)) {
            node.forEach((item, index) => visit(item, [...nodePath, index.toString()]));
            return;
        }
        if (!isRecord(node)) {
            return;
        }
        const ref = node.$ref;
        if (typeof ref === "string") {
            const reason = getUnresolvedReason({ ref, document, specDirectory });
            if (reason != null) {
                unresolved.push({ ref, nodePath, reason });
            }
            return;
        }
        for (const [key, value] of Object.entries(node)) {
            visit(value, [...nodePath, key]);
        }
    };

    visit(document, []);
    return unresolved;
}

/**
 * Returns a human-readable reason when a $ref cannot be resolved, or undefined when it resolves.
 *
 * Local pointers are resolved against the bundled document. Remote refs are only reported when the
 * referenced file is missing on disk: refs pointing at files that do exist are left alone, since the
 * bundler intentionally keeps some of them in place (for example, circular references).
 */
function getUnresolvedReason({
    ref,
    document,
    specDirectory
}: {
    ref: string;
    document: object;
    specDirectory: AbsoluteFilePath;
}): string | undefined {
    if (ref.startsWith("#")) {
        return pointerExists({ document, pointer: ref.slice(1) })
            ? undefined
            : "the pointer does not exist in the specification";
    }

    const [filepath] = ref.split("#");
    if (filepath == null || filepath.length === 0) {
        return undefined;
    }
    if (isRemoteUrl(filepath)) {
        return undefined;
    }

    if (doesPathExistSync(resolve(specDirectory, decodeURIComponent(filepath)))) {
        return undefined;
    }
    return `the file "${filepath}" does not exist`;
}

function isRecord(value: unknown): value is Record<string, unknown> {
    return typeof value === "object" && value != null && !Array.isArray(value);
}

function isRemoteUrl(filepath: string): boolean {
    return /^[a-zA-Z][a-zA-Z\d+\-.]*:\/\//.test(filepath);
}

function pointerExists({ document, pointer }: { document: object; pointer: string }): boolean {
    if (!pointer.startsWith("/")) {
        return true;
    }

    let current: unknown = document;
    for (const rawSegment of pointer.slice(1).split("/")) {
        const segment = decodeURIComponent(rawSegment).replaceAll("~1", "/").replaceAll("~0", "~");
        if (Array.isArray(current)) {
            const index = Number.parseInt(segment, 10);
            if (Number.isNaN(index) || index < 0 || index >= current.length) {
                return false;
            }
            current = current[index];
            continue;
        }
        if (!isRecord(current)) {
            return false;
        }
        if (!Object.hasOwn(current, segment)) {
            return false;
        }
        current = current[segment];
    }
    return true;
}
