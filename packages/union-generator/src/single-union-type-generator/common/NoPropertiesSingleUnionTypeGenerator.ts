import { OptionalKind, PropertySignatureStructure, ts } from "ts-morph";
import { SingleUnionTypeGenerator } from "../SingleUnionTypeGenerator";

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

    public getVisitMethodParameterType(): ts.TypeNode | undefined {
        return undefined;
    }

    public getVisitorArguments(): ts.Expression[] {
        return [];
    }

    public getBuilderArgsFromExistingValue(): ts.Expression[] {
        return [];
    }
}
