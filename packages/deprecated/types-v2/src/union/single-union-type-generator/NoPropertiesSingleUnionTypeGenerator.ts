import { Zurg } from "@fern-typescript/commons-v2";
import { OptionalKind, PropertySignatureStructure, ts } from "ts-morph";
import { SingleUnionTypeGenerator } from "./SingleUnionTypeGenerator";

export class NoPropertiesSingleUnionTypeGenerator implements SingleUnionTypeGenerator {
    public getExtendsForInterface(): ts.TypeNode[] {
        return [];
    }

    public getNonDiscriminantPropertiesForInterface(): OptionalKind<PropertySignatureStructure>[] {
        return [];
    }

    public getParametersForBuilder(): ts.ParameterDeclaration[] {
        return [];
    }

    public getNonDiscriminantPropertiesForBuilder(): ts.ObjectLiteralElementLike[] {
        return [];
    }

    public getVisitorArgumentsForBuilder(): ts.Expression[] {
        return [];
    }

    public getVisitMethodParameterType(): ts.TypeNode | undefined {
        return undefined;
    }

    public getVisitorArguments(): ts.Expression[] {
        return [];
    }

    public getBuilderArguments(): ts.Expression[] {
        return [];
    }

    public getNonDiscriminantPropertiesForSchema(): Zurg.union.SingleUnionType["nonDiscriminantProperties"] {
        return { isInline: true, properties: [] };
    }
}
