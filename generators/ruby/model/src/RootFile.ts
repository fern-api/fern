import { AstNode, ClassReference, Import } from '@fern-api/ruby-codegen'

// The root file is just a container of imports for easy access
// to the different modules.
export class RootFile extends AstNode {
    classReferences: ClassReference[]
    constructor(classReferences: ClassReference[]) {
        super({ writeImports: true })
        this.classReferences = classReferences
    }

    public writeInternal(_startingTabSpaces: number): void {
        return
    }

    public getImports(): Set<Import> {
        return new Set(
            Array.from(this.classReferences.entries())
                .map(([_, cr]) => cr.import_)
                .filter((i) => i !== undefined) as Import[]
        )
    }
}
