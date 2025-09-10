import { LiteralEnum, swift } from "@fern-api/swift-codegen";

import { StringEnumGenerator } from "../enum";

export declare namespace LiteralEnumGenerator {
    interface Args {
        name: string;
        literalValue: string;
        docsContent?: string;
    }
}

export class LiteralEnumGenerator {
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
                        unsafeName: LiteralEnum.generateEnumCaseLabel(this.literalValue),
                        rawValue: this.literalValue
                    }
                ]
            },
            docsContent: this.docsContent
        });
        return stringEnumGenerator.generate();
    }
}
