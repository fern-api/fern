import { assertNever } from "@fern-api/core-utils";
import { RelativeFilePath } from "@fern-api/fs-utils";
import { SwiftFile } from "@fern-api/swift-base";
import { swift } from "@fern-api/swift-codegen";

import { ObjectProperty } from "@fern-fern/ir-sdk/api";
import { TypeDeclaration, TypeReference } from "@fern-fern/ir-sdk/api";

export class ObjectGenerator {
    private readonly typeDeclaration: TypeDeclaration;

    public constructor(typeDeclaration: TypeDeclaration) {
        this.typeDeclaration = typeDeclaration;
    }

    public generate(): SwiftFile {
        const astNode = this.generateAstNodeForTypeDeclaration();
        const fileContents = astNode?.toString() ?? "";
        return new SwiftFile({
            filename: this.getFilename(),
            directory: this.getFileDirectory(),
            fileContents
        });
    }

    private getFilename(): string {
        // TODO: File names need to be unique across the generated output so we'll need to validate this
        return this.typeDeclaration.name.name.pascalCase.unsafeName + ".swift";
    }

    private getFileDirectory(): RelativeFilePath {
        return RelativeFilePath.of(
            [...this.typeDeclaration.name.fernFilepath.allParts.map((path) => path.pascalCase.safeName)].join("/")
        );
    }

    private generateAstNodeForTypeDeclaration(): swift.Struct | null {
        switch (this.typeDeclaration.shape.type) {
            case "object":
                return swift.struct({
                    name: this.typeDeclaration.name.name.pascalCase.safeName,
                    properties: this.typeDeclaration.shape.properties.map((p) => this.generateAstNodeForProperty(p)),
                    accessLevel: swift.AccessLevel.Public
                });
            case "alias":
            case "enum":
            case "undiscriminatedUnion":
            case "union":
                return null;
            default:
                assertNever(this.typeDeclaration.shape);
        }
    }

    private generateAstNodeForProperty(property: ObjectProperty): swift.Property {
        return swift.property({
            unsafeName: property.name.name.camelCase.unsafeName,
            accessLevel: swift.AccessLevel.Public,
            declarationType: swift.DeclarationType.Let,
            type: this.generateAstNodeForTypeReference(property.valueType),
            optional: property.valueType.type === "container" && property.valueType.container.type === "optional"
        });
    }

    private generateAstNodeForTypeReference(typeReference: TypeReference): swift.Type {
        switch (typeReference.type) {
            case "container":
                switch (typeReference.container.type) {
                    case "literal":
                    case "map":
                    case "set":
                    case "nullable":
                        return swift.Type.any();
                    case "optional":
                        return this.generateAstNodeForTypeReference(typeReference.container.optional);
                    case "list":
                        return swift.Type.array(this.generateAstNodeForTypeReference(typeReference.container.list));
                    default:
                        assertNever(typeReference.container);
                }
            case "primitive":
                // TODO: Do we look at v2?
                switch (typeReference.primitive.v1) {
                    case "BASE_64":
                    case "BIG_INTEGER":
                    case "DATE":
                    case "DATE_TIME":
                    case "FLOAT":
                    case "LONG":
                    case "UINT":
                    case "UINT_64":
                    case "UUID":
                        return swift.Type.any();
                    case "BOOLEAN":
                        return swift.Type.bool();
                    case "DOUBLE":
                        return swift.Type.double();
                    case "INTEGER":
                        return swift.Type.int();
                    case "STRING":
                        return swift.Type.string();
                    default:
                        assertNever(typeReference.primitive.v1);
                }
            case "named":
                return swift.Type.any();
            case "unknown":
                return swift.Type.any();
            default:
                assertNever(typeReference);
        }
    }
}
