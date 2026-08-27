/** Parsed SemVer precedence components, excluding build metadata. */
export interface ParsedSemver {
    core: readonly [string, string, string];
    prerelease: readonly string[] | null;
}

const EXACT_SEMVER_PATTERN =
    /^(0|[1-9]\d*)\.(0|[1-9]\d*)\.(0|[1-9]\d*)(?:-((?:0|[1-9]\d*|\d*[A-Za-z-][0-9A-Za-z-]*)(?:\.(?:0|[1-9]\d*|\d*[A-Za-z-][0-9A-Za-z-]*))*))?(?:\+[0-9A-Za-z-]+(?:\.[0-9A-Za-z-]+)*)?$/;

/** Parses only complete SemVer 2.0 versions, rejecting ranges, aliases, and partial versions. */
export function parseExactSemver(value: string): ParsedSemver | null {
    const match = EXACT_SEMVER_PATTERN.exec(value);
    if (match === null || match[1] === undefined || match[2] === undefined || match[3] === undefined) {
        return null;
    }

    return {
        core: [match[1], match[2], match[3]],
        prerelease: match[4]?.split(".") ?? null
    };
}

/** Compares two parsed exact versions according to SemVer 2.0 precedence. */
export function compareSemver(left: ParsedSemver, right: ParsedSemver): number {
    for (let index = 0; index < left.core.length; index += 1) {
        const result = compareNumericIdentifier(left.core[index] ?? "", right.core[index] ?? "");
        if (result !== 0) {
            return result;
        }
    }

    return comparePrerelease(left.prerelease, right.prerelease);
}

function comparePrerelease(left: readonly string[] | null, right: readonly string[] | null): number {
    if (left === null || right === null) {
        return left === right ? 0 : left === null ? 1 : -1;
    }

    const length = Math.max(left.length, right.length);
    for (let index = 0; index < length; index += 1) {
        const leftIdentifier = left[index];
        const rightIdentifier = right[index];
        if (leftIdentifier === undefined || rightIdentifier === undefined) {
            return leftIdentifier === rightIdentifier ? 0 : leftIdentifier === undefined ? -1 : 1;
        }

        const result = comparePrereleaseIdentifier(leftIdentifier, rightIdentifier);
        if (result !== 0) {
            return result;
        }
    }

    return 0;
}

function comparePrereleaseIdentifier(left: string, right: string): number {
    const leftIsNumeric = /^\d+$/.test(left);
    const rightIsNumeric = /^\d+$/.test(right);
    if (leftIsNumeric && rightIsNumeric) {
        return compareNumericIdentifier(left, right);
    }
    if (leftIsNumeric !== rightIsNumeric) {
        return leftIsNumeric ? -1 : 1;
    }
    return left === right ? 0 : left < right ? -1 : 1;
}

function compareNumericIdentifier(left: string, right: string): number {
    if (left.length !== right.length) {
        return left.length < right.length ? -1 : 1;
    }
    return left === right ? 0 : left < right ? -1 : 1;
}
