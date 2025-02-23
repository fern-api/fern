import { HttpPath, HttpPathPart } from "@fern-api/ir-sdk";

export function constructHttpPath(rawPath: string): HttpPath {
    const rawPathGenerator = createStringGenerator(rawPath);
    const { value: head, done } = readUntil(rawPathGenerator, "{");
    if (done) {
        return { head, parts: [] };
    } else {
        return {
            head,
            parts: [...getAllParts(rawPathGenerator)]
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
            tail: untilNextOpeningBrace.value
        };
    } while (!done);
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
        done: nextResult.done ?? false
    };
}
