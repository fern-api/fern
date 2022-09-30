import { DeclaredTypeName } from "@fern-fern/ir-model/types";
import { Zurg } from "@fern-typescript/commons-v2";
import { SdkFile } from "@fern-typescript/sdk-declaration-handler";
import { OptionalKind, PropertySignatureStructure, ts } from "ts-morph";
import { SingleUnionTypeGenerator } from "./SingleUnionTypeGenerator";

export class SamePropertyAsObjectSingleUnionTypeGenerator implements SingleUnionTypeGenerator {
    private extended: DeclaredTypeName;
    private static BUILDER_PARAMETER_NAME = "value";

    constructor({ extended }: { extended: DeclaredTypeName }) {
        this.extended = extended;
    }

    public getExtendsForInterface(file: SdkFile, { isRaw }: { isRaw: boolean }): ts.TypeNode[] {
        return [
            isRaw
                ? file.getReferenceToRawNamedType(this.extended).typeNode
                : file.getReferenceToNamedType(this.extended).typeNode,
        ];
    }

    public getNonDiscriminantPropertiesForInterface(): OptionalKind<PropertySignatureStructure>[] {
        return [];
    }

    public getParametersForBuilder(file: SdkFile): ts.ParameterDeclaration[] {
        return [
            ts.factory.createParameterDeclaration(
                undefined,
                undefined,
                undefined,
                SamePropertyAsObjectSingleUnionTypeGenerator.BUILDER_PARAMETER_NAME,
                undefined,
                file.getReferenceToNamedType(this.extended).typeNode
            ),
        ];
    }

    public getNonDiscriminantPropertiesForBuilder(): ts.ObjectLiteralElementLike[] {
        return [
            ts.factory.createSpreadAssignment(
                ts.factory.createIdentifier(SamePropertyAsObjectSingleUnionTypeGenerator.BUILDER_PARAMETER_NAME)
            ),
        ];
    }

    public getVisitorArgumentsForBuilder(): ts.Expression[] {
        return [ts.factory.createIdentifier(SamePropertyAsObjectSingleUnionTypeGenerator.BUILDER_PARAMETER_NAME)];
    }

    public getVisitMethodParameterType(file: SdkFile): ts.TypeNode | undefined {
        return file.getReferenceToNamedType(this.extended).typeNode;
    }

    public getVisitorArguments({ referenceToUnionValue }: { referenceToUnionValue: ts.Expression }): ts.Expression[] {
        return [referenceToUnionValue];
    }

    public getNonDiscriminantPropertiesForSchema(
        file: SdkFile
    ): Zurg.union.SingleUnionType["nonDiscriminantProperties"] {
        return {
            isInline: false,
            objectSchema: file.getSchemaOfNamedType(this.extended),
        };
    }
}
