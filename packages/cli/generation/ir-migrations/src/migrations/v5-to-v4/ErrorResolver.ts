import { IrVersions } from "../../ir-versions"

export type StringifiedErrorName = string

export interface ErrorResolver {
    getDeclaration(errorName: IrVersions.V5.errors.DeclaredErrorName): IrVersions.V5.errors.ErrorDeclaration
}

export class ErrorResolverImpl implements ErrorResolver {
    private errors: Record<StringifiedErrorName, IrVersions.V5.errors.ErrorDeclaration>

    constructor(ir: IrVersions.V5.ir.IntermediateRepresentation) {
        this.errors = ir.errors.reduce(
            (acc, error) => ({
                ...acc,
                [stringifyErrorName(error.name)]: error
            }),
            {}
        )
    }

    public getDeclaration(errorName: IrVersions.V5.errors.DeclaredErrorName): IrVersions.V5.errors.ErrorDeclaration {
        const key = stringifyErrorName(errorName)
        const error = this.errors[key]
        if (error == null) {
            throw new Error("Error does not exist: " + key)
        }
        return error
    }
}

function stringifyErrorName(errorName: IrVersions.V5.errors.DeclaredErrorName): string {
    return `${errorName.fernFilepath.join("/")}:${errorName.name.originalName}`
}
