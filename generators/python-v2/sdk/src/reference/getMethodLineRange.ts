export interface LineRange {
    start: number;
    end: number;
}

const CLASS_MEMBER_START = /^ {4}[@A-Za-z_#]/;
const METHOD_DEFINITION = /^ {4}(?:async\s+)?def\s+(\w+)\s*\(/;

/**
 * Returns the 1-based line range of `methodName` in the first non-async top-level class of a
 * generated Python client file, including decorators and any `typing.overload` signatures.
 */
export function getMethodLineRange({
    source,
    methodName
}: {
    source: string;
    methodName: string;
}): LineRange | undefined {
    const lines = source.split(/\r?\n/);
    const classStart = lines.findIndex((line) => /^class (?!Async)\w+/.test(line));
    if (classStart === -1) {
        return undefined;
    }
    let classEnd = lines.length;
    for (let i = classStart + 1; i < lines.length; i++) {
        if (/^\S/.test(lines[i] ?? "")) {
            classEnd = i;
            break;
        }
    }

    const memberStarts: number[] = [];
    for (let i = classStart + 1; i < classEnd; i++) {
        if (CLASS_MEMBER_START.test(lines[i] ?? "")) {
            memberStarts.push(i);
        }
    }

    let start: number | undefined;
    let end: number | undefined;
    let decoratorStart: number | undefined;
    for (let index = 0; index < memberStarts.length; index++) {
        const lineIndex = memberStarts[index];
        if (lineIndex == null) {
            continue;
        }
        const line = lines[lineIndex] ?? "";
        if (line.startsWith("    @")) {
            decoratorStart ??= lineIndex;
            continue;
        }
        const memberStart = decoratorStart ?? lineIndex;
        decoratorStart = undefined;
        if (METHOD_DEFINITION.exec(line)?.[1] !== methodName) {
            if (start != null) {
                break;
            }
            continue;
        }
        start ??= memberStart;
        let memberEnd = (memberStarts[index + 1] ?? classEnd) - 1;
        while (memberEnd > lineIndex && (lines[memberEnd] ?? "").trim() === "") {
            memberEnd--;
        }
        end = memberEnd;
    }

    if (start == null || end == null) {
        return undefined;
    }
    return { start: start + 1, end: end + 1 };
}
