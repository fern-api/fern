import { HttpPathParameterSchema } from "../schemas";
import { TypeReferenceWithDocsSchema } from "../schemas/TypeReferenceSchema";
import { VariableReferenceSchema } from "../schemas/VariableReferenceSchema";

export interface PathParameterDeclarationVisitor<R> {
    nonVariable: (pathParameter: TypeReferenceWithDocsSchema) => R;
    variable: (pathParameter: VariableReferenceSchema | string) => R;
}

export function visitRawPathParameter<R>(
    rawPathParameter: HttpPathParameterSchema,
    visitor: PathParameterDeclarationVisitor<R>
): R {
    if (isVariablePathParameter(rawPathParameter)) {
        return visitor.variable(rawPathParameter);
    } else {
        return visitor.nonVariable(rawPathParameter);
    }
}

export function isVariablePathParameter(
    rawPathParameter: HttpPathParameterSchema
): rawPathParameter is VariableReferenceSchema | string {
    if (typeof rawPathParameter === "string") {
        return rawPathParameter.startsWith("$");
    }
    return "variable" in rawPathParameter;
}
