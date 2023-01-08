import { assertNever } from "@fern-api/core-utils";
import { constructFernFileContext, ResolvedType, TypeResolver, TypeResolverImpl } from "@fern-api/ir-generator";
import { Workspace } from "@fern-api/workspace-loader";
import { isRawEnumDefinition, isRawObjectDefinition, isRawUnionDefinition } from "@fern-api/yaml-schema";
import { RuleRunnerArgs } from "./Rule";
import { CASINGS_GENERATOR } from "./utils/casingsGenerator";

export class ComplexTypeDetector {
    private typeResolver: TypeResolver;

    constructor(workspace: Workspace) {
        this.typeResolver = new TypeResolverImpl(workspace);
    }

    public isTypeComplex(type: string, ruleRunnerArgs: RuleRunnerArgs): boolean | undefined {
        const resolvedType = this.typeResolver.resolveType({
            type,
            file: constructFernFileContext({
                relativeFilepath: ruleRunnerArgs.relativeFilepath,
                serviceFile: ruleRunnerArgs.contents,
                casingsGenerator: CASINGS_GENERATOR,
            }),
        });
        if (resolvedType == null) {
            return undefined;
        }
        return this.isResolvedReferenceComplex(resolvedType);
    }

    private isResolvedReferenceComplex(type: ResolvedType): boolean {
        switch (type._type) {
            case "container":
                return type.container._type !== "optional" || this.isResolvedReferenceComplex(type.container.itemType);
            case "named":
                return this.isNamedTypeComplex(type);
            case "primitive":
                return false;
            case "unknown":
                return true;
        }
    }

    private isNamedTypeComplex(type: ResolvedType.Named): boolean {
        if (isRawObjectDefinition(type.declaration) || isRawUnionDefinition(type.declaration)) {
            return true;
        }
        if (isRawEnumDefinition(type.declaration)) {
            return false;
        }
        assertNever(type.declaration);
    }
}
