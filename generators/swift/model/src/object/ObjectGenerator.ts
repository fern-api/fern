import { RelativeFilePath } from "@fern-api/fs-utils";
import { SwiftFile } from "@fern-api/swift-base";
import { swift } from "@fern-api/swift-codegen";
import { InlinedRequestBodyProperty, ObjectProperty } from "@fern-fern/ir-sdk/api";

import { getSwiftTypeForTypeReference } from "../converters";
import { StructGenerator } from "../helpers/struct-generator";

export class ObjectGenerator {
    private readonly name: string;
    private readonly directory: RelativeFilePath;
    private readonly properties: (ObjectProperty | InlinedRequestBodyProperty)[];
    private readonly extendedProperties?: ObjectProperty[];

    public constructor(
        name: string,
        directory: RelativeFilePath,
        properties: (ObjectProperty | InlinedRequestBodyProperty)[],
        extendedProperties?: ObjectProperty[]
    ) {
        this.name = name;
        this.directory = directory;
        this.properties = properties;
        this.extendedProperties = extendedProperties;
    }

    private get filename(): string {
        return this.name + ".swift";
    }

    public generate(): SwiftFile {
        const swiftStruct = this.generateStructForTypeDeclaration();
        return new SwiftFile({
            filename: this.filename,
            directory: this.directory,
            fileContents: [swiftStruct]
        });
    }

    public generateStructForTypeDeclaration(): swift.Struct {
        return new StructGenerator({
            name: this.name,
            constantPropertyDefinitions: [],
            dataPropertyDefinitions: this.properties.map((p) => ({
                unsafeName: p.name.name.camelCase.unsafeName,
                rawName: p.name.wireValue,
                type: getSwiftTypeForTypeReference(p.valueType)
            })),
            additionalProperties: true
        }).generate();
    }
}
