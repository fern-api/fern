import path from "path";
import { z } from "zod";

import { addPrefixToString } from "@fern-api/core-utils";
import { TaskContext } from "@fern-api/task-context";

export async function validateSchema<T>({
    schema,
    value,
    context,
    filepathBeingParsed
}: {
    schema: z.ZodType<T>;
    value: unknown;
    context: TaskContext;
    filepathBeingParsed: string;
}): Promise<T> {
    const result = await schema.safeParseAsync(value);
    if (result.success) {
        return result.data;
    }

    const issues: string[] = result.error.errors.map((issue) => {
        const message = issue.path.length > 0 ? `${issue.message} at "${joinZodPath(issue.path)}"` : issue.message;
        return addPrefixToString({
            content: message,
            prefix: "  - "
        });
    });

    const errorMessage = [`Failed to parse file: ${path.relative(process.cwd(), filepathBeingParsed)}`, ...issues].join(
        "\n"
    );

    return context.failAndThrow(errorMessage);
}

// copied from https://github.com/causaly/zod-validation-error/blob/main/lib/utils/joinPath.ts
export function joinZodPath(arr: (string | number)[]): string {
    return arr.reduce<string>((acc, value) => {
        if (typeof value === "number") {
            return acc + "[" + value + "]";
        }

        const separator = acc === "" ? "" : ".";
        return acc + separator + value;
    }, "");
}
