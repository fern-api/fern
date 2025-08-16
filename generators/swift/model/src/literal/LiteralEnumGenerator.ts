import { swift } from "@fern-api/swift-codegen";
import { camelCase } from "lodash-es";

import { StringEnumGenerator } from "../enum";
import { pascalCase } from "./pascal-case";

export declare namespace LiteralEnumGenerator {
    interface Args {
        name: string;
        literalValue: string;
        docsContent?: string;
    }
}

export class LiteralEnumGenerator {
    /**
     * Generates a safe name for a string literal enum from the literal value.
     */
    public static generateName(literalValue: string): string {
        const sanitizedLiteralValue = this.sanitizeLiteralValue(literalValue);
        return pascalCase(sanitizedLiteralValue);
    }

    /**
     * Generates a safe enum case label for a string literal enum from the literal value.
     */
    public static generateEnumCaseLabel(literalValue: string): string {
        const sanitizedLiteralValue = this.sanitizeLiteralValue(literalValue);
        return camelCase(sanitizedLiteralValue);
    }

    /**
     * Sanitizes a literal value to ensure it is a valid Swift identifier.
     */
    public static sanitizeLiteralValue(literalValue: string): string {
        if (literalValue === "") {
            return "empty";
        }

        // Step 1: Replace invalid characters with underscores or remove them
        // Keep letters, digits, and underscores. Replace everything else with underscores.
        let sanitized = literalValue.replace(/[^a-zA-Z0-9_]/g, "_");

        // Step 2: Remove consecutive underscores and leading/trailing underscores
        sanitized = sanitized.replace(/_+/g, "_").replace(/^_+|_+$/g, "");

        // Step 3: Handle the case where sanitization resulted in an empty string
        if (sanitized === "") {
            return "value";
        }

        // Step 4: Ensure it starts with a letter or underscore (not a digit)
        if (/^\d/.test(sanitized)) {
            sanitized = "value_" + sanitized;
        }

        return sanitized;
    }

    private readonly name: string;
    private readonly literalValue: string;
    private readonly docsContent?: string;

    public constructor({ name, literalValue, docsContent }: LiteralEnumGenerator.Args) {
        this.name = name;
        this.literalValue = literalValue;
        this.docsContent = docsContent;
    }

    public generate(): swift.EnumWithRawValues {
        const stringEnumGenerator = new StringEnumGenerator({
            name: this.name,
            source: {
                type: "custom",
                values: [
                    {
                        unsafeName: LiteralEnumGenerator.generateEnumCaseLabel(this.literalValue),
                        rawValue: this.literalValue
                    }
                ]
            },
            docsContent: this.docsContent
        });
        return stringEnumGenerator.generate();
    }
}
