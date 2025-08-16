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
     * Sanitizes a literal value to produce a clean alphanumeric string suitable for Swift identifiers.
     * Uses "value" as fallback for anything that doesn't result in a clean identifier.
     */
    public static sanitizeLiteralValue(originalValue: string): string {
        if (originalValue === "") {
            return "empty";
        }
        let sanitizedValue = originalValue;
        const isAlreadyValid = /^[a-zA-Z][a-zA-Z0-9]*$/.test(originalValue);
        if (!isAlreadyValid) {
            // Remove invalid characters from the left first to avoid unwanted capitalization
            sanitizedValue = sanitizedValue.replace(/^[^a-zA-Z0-9]+/, "");
            // Apply camelCase to preserve word boundaries
            sanitizedValue = camelCase(sanitizedValue);
        }
        // If it starts with a digit, use "value"
        if (/^\d/.test(sanitizedValue)) {
            return "value";
        }
        if (sanitizedValue === "") {
            return "value";
        }
        return sanitizedValue;
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
