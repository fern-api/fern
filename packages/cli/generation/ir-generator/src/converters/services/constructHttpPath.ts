import { HttpPath, HttpPathPart } from "@fern-fern/ir-model/services/http";

export function constructHttpPath(rawPath: string): HttpPath {
    const rawPathGenerator = createStringGenerator(rawPath);
    const { value: head, done } = readUntil(rawPathGenerator, "{");
    if (done) {
        return { head: removeTrailingSlash(head), parts: [] };
    } else {
        return {
            head,
            parts: [...getAllParts(rawPathGenerator)],
        };
    }
}

function* getAllParts(rawPathGenerator: Generator<string>): Generator<HttpPathPart> {
    let done: boolean;
    do {
        const { value: pathParameter } = readUntil(rawPathGenerator, "}");
        const untilNextOpeningBrace = readUntil(rawPathGenerator, "{");
        done = untilNextOpeningBrace.done;
        yield {
            pathParameter,
            tail: done ? removeTrailingSlash(untilNextOpeningBrace.value) : untilNextOpeningBrace.value,
        };
    } while (!done);
}

function removeTrailingSlash(path: string): string {
    return path.endsWith("/") ? path.slice(0, -1) : path;
}

function* createStringGenerator(str: string) {
    for (const char of str) {
        yield char;
    }
}

function readUntil(generator: Generator<string>, delimiter: string): { value: string; done: boolean } {
    let value = "";

    let nextResult = generator.next();
    while (nextResult.done !== true && nextResult.value !== delimiter) {
        value += nextResult.value;
        nextResult = generator.next();
    }

    return {
        value,
        done: nextResult.done ?? false,
    };
}
