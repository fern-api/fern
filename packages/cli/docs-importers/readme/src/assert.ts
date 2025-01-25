import type { Element, Root } from "hast";
import { CONTINUE, EXIT, visit } from "unist-util-visit";
import { z } from "zod";

export const StringArraySchema = z.array(z.string());

export function assertIsNumber(val: unknown): asserts val is number {
    z.number().parse(val);
}

export function assertIsDefined<T>(val: T): asserts val is NonNullable<T> {
    if (val === undefined || val == null) {
        throw new Error("Value is nullable.");
    }
}

export function assertIsStringArray(val: unknown): asserts val is Array<string> {
    StringArraySchema.parse(val);
}

export function isReadmeDeployment(hastRoot: Root): boolean {
    let hasReadmeDeployMeta = false;
    visit(hastRoot, "element", (element: Element) => {
        if (
            element.tagName === "meta" &&
            typeof element.properties.name === "string" &&
            element.properties.name === "readme-deploy"
        ) {
            hasReadmeDeployMeta = true;
            return EXIT;
        }
        return CONTINUE;
    });

    return hasReadmeDeployMeta;
}
