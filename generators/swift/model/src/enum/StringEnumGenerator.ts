import { assertNever } from '@fern-api/core-utils'
import { RelativeFilePath } from '@fern-api/fs-utils'
import { SwiftFile } from '@fern-api/swift-base'
import { swift } from '@fern-api/swift-codegen'

import { TypeDeclaration } from '@fern-fern/ir-sdk/api'

export class StringEnumGenerator {
    private readonly typeDeclaration: TypeDeclaration

    public constructor(typeDeclaration: TypeDeclaration) {
        this.typeDeclaration = typeDeclaration
    }

    public generate(): SwiftFile {
        const astNode = this.generateAstNodeForTypeDeclaration()
        const fileContents = astNode?.toString() ?? ''
        return new SwiftFile({
            filename: this.getFilename(),
            directory: this.getFileDirectory(),
            fileContents
        })
    }

    private getFilename(): string {
        // TODO: File names need to be unique across the generated output so we'll need to validate this
        return this.typeDeclaration.name.name.pascalCase.unsafeName + '.swift'
    }

    private getFileDirectory(): RelativeFilePath {
        return RelativeFilePath.of(
            [...this.typeDeclaration.name.fernFilepath.allParts.map((path) => path.pascalCase.safeName)].join('/')
        )
    }

    private generateAstNodeForTypeDeclaration(): swift.EnumWithRawValues | null {
        switch (this.typeDeclaration.shape.type) {
            case 'enum':
                return swift.enumWithRawValues({
                    name: this.typeDeclaration.name.name.pascalCase.unsafeName,
                    accessLevel: swift.AccessLevel.Public,
                    conformances: ['String', 'Codable', 'Hashable', 'Sendable', 'CaseIterable'],
                    cases: this.typeDeclaration.shape.values.map((val) => ({
                        unsafeName: val.name.name.camelCase.unsafeName,
                        rawValue: val.name.wireValue
                    }))
                })
            case 'object':
            case 'alias':
            case 'undiscriminatedUnion':
            case 'union':
                return null
            default:
                assertNever(this.typeDeclaration.shape)
        }
    }
}
