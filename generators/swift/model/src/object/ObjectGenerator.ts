import { assertNever } from "@fern-api/core-utils";
import { RelativeFilePath } from "@fern-api/fs-utils";
import { SwiftFile } from "@fern-api/swift-base";
import { swift } from "@fern-api/swift-codegen";

import { InlinedRequestBodyProperty, ObjectProperty } from "@fern-fern/ir-sdk/api";

import { getSwiftTypeForTypeReference } from "../converters";
import { StructGenerator } from "../helpers/struct-generator";

type ObjectType = "schema" | "inlined-request";

export class ObjectGenerator {
    private readonly name: string;
    private readonly objectType: ObjectType;
    private readonly properties: (ObjectProperty | InlinedRequestBodyProperty)[];
    private readonly extendedProperties?: ObjectProperty[];

    public constructor(
        name: string,
        objectType: ObjectType,
        properties: (ObjectProperty | InlinedRequestBodyProperty)[],
        extendedProperties?: ObjectProperty[]
    ) {
        this.name = name;
        this.objectType = objectType;
        this.properties = properties;
        this.extendedProperties = extendedProperties;
    }

    private getFileDirectory(): RelativeFilePath {
        switch (this.objectType) {
            case "schema":
                return RelativeFilePath.of("Schemas");
            case "inlined-request":
                return RelativeFilePath.of("Requests");
            default:
                assertNever(this.objectType);
        }
    }

    private getFilename(): string {
        return this.name + ".swift";
    }

    public generate(): SwiftFile {
        const swiftStruct = this.generateStructForTypeDeclaration();
        return new SwiftFile({
            filename: this.getFilename(),
            directory: this.getFileDirectory(),
            fileContents: [swiftStruct]
        });
    }

    public generateStructForTypeDeclaration(): swift.Struct {
        return new StructGenerator({
            name: this.name,
            constantPropertyDefinitions: [],
            dataPropertyDefinitions: this.properties.map((p) => ({
                unsafeName: p.name.name.camelCase.unsafeName,
                nameWireValue: p.name.wireValue,
                type: getSwiftTypeForTypeReference(p.valueType)
            })),
            additionalProperties: true
        }).generate();
    }
}
