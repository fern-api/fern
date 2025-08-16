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
    public static sanitizeLiteralValue(literalValue: string): string {
        if (literalValue === "") {
            return "empty";
        }
        // Keep only letters and digits (no underscores)
        let sanitized = literalValue.replace(/[^a-zA-Z0-9]/g, "");
        // If it starts with a digit, use "value"
        if (/^\d/.test(sanitized)) {
            return "value";
        }
        // If sanitization resulted in empty string, use "value"
        if (sanitized === "") {
            return "value";
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
