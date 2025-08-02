import { assertNever, noop } from "@fern-api/core-utils";
import { RelativeFilePath } from "@fern-api/fs-utils";
import { SwiftFile } from "@fern-api/swift-base";
import { swift } from "@fern-api/swift-codegen";
import { UndiscriminatedUnionTypeDeclaration } from "@fern-fern/ir-sdk/api";

import { ModelGeneratorContext } from "../ModelGeneratorContext";

export class UndiscriminatedUnionGenerator {
    private readonly name: string;
    private readonly directory: RelativeFilePath;
    private readonly unionTypeDeclaration: UndiscriminatedUnionTypeDeclaration;
    private readonly context: ModelGeneratorContext;

    public constructor(
        name: string,
        directory: RelativeFilePath,
        unionTypeDeclaration: UndiscriminatedUnionTypeDeclaration,
        context: ModelGeneratorContext
    ) {
        this.name = name;
        this.directory = directory;
        this.unionTypeDeclaration = unionTypeDeclaration;
        this.context = context;
    }

    private get filename(): string {
        return this.name + ".swift";
    }

    public generate(): SwiftFile {
        const swiftEnum = this.generateEnumForTypeDeclaration();
        return new SwiftFile({
            filename: this.filename,
            directory: this.directory,
            fileContents: [swiftEnum]
        });
    }

    private generateEnumForTypeDeclaration(): swift.EnumWithAssociatedValues {
        return swift.enumWithAssociatedValues({
            name: this.name,
            accessLevel: swift.AccessLevel.Public,
            conformances: [swift.Protocol.Codable, swift.Protocol.Hashable, swift.Protocol.Sendable],
            cases: this.generateCasesForTypeDeclaration(),
            initializers: this.generateInitializers(),
            methods: this.generateMethods(),
            nestedTypes: this.generateNestedTypesForTypeDeclaration()
        });
    }

    private generateInitializers(): swift.Initializer[] {
        return [this.generateInitializerForDecoder()];
    }

    private generateInitializerForDecoder() {
        return swift.initializer({
            accessLevel: swift.AccessLevel.Public,
            throws: true,
            parameters: [],
            body: swift.CodeBlock.withStatements([])
        });
    }

    private generateMethods(): swift.Method[] {
        return [this.generateEncodeMethod()];
    }

    private generateEncodeMethod(): swift.Method {
        return swift.method({
            unsafeName: "encode",
            accessLevel: swift.AccessLevel.Public,
            parameters: [],
            throws: true,
            returnType: swift.Type.void(),
            body: swift.CodeBlock.withStatements([])
        });
    }

    private generateCasesForTypeDeclaration(): swift.EnumWithAssociatedValues.Case[] {
        return [];
    }

    private generateNestedTypesForTypeDeclaration(): (swift.Struct | swift.EnumWithRawValues)[] {
        return [];
    }
}
