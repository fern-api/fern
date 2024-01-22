import { DeclaredTypeName } from "@fern-fern/ir-sdk/api";
import { getLocationForTypeDeclaration } from "../AbstractionUtilities";
import { Argument } from "../Argument";
import { ClassReference, GenericClassReference, HashInstance, HashReference } from "../classes/ClassReference";
import { FunctionInvocation } from "../functions/FunctionInvocation";
import { Function_ } from "../functions/Function_";
import { Import } from "../Import";
import { Module_ } from "../Module_";
import { Variable } from "../Variable";

export declare namespace Enum {
    export interface ReferenceInit extends ClassReference.Init {
        name: string;
    }
    export interface InstanceInit extends ClassReference.Init {
        contents: Map<string, string>;
    }
}

// TODO: allow for per-enum documentation
export class Enum extends HashInstance {
    constructor({ contents, documentation }: Enum.InstanceInit) {
        super({ contents, isFrozen: true, documentation });
    }
}

export class EnumReference extends HashReference {
    constructor({ name }: Enum.ReferenceInit) {
        super({ name, keyType: "String", valueType: "String" });
    }

    public toJson(variable: Variable | string): FunctionInvocation | undefined {
        return new FunctionInvocation({
            baseFunction: new Function_({ name: "fetch", functionBody: [] }),
            onObject: variable
        });
    }

    public fromJson(variable: Variable | string): FunctionInvocation | undefined {
        return new FunctionInvocation({
            baseFunction: new Function_({ name: "key", functionBody: [] }),
            onObject: this,
            arguments_: [new Argument({ value: variable, isNamed: false, type: GenericClassReference })]
        });
    }

    static fromDeclaredTypeName(declaredTypeName: DeclaredTypeName): EnumReference {
        const crName = declaredTypeName.name.screamingSnakeCase.safeName;
        const location = getLocationForTypeDeclaration(declaredTypeName);
        const moduleBreadcrumbs = Module_.getModulePathFromTypeName(declaredTypeName);
        return new EnumReference({
            name: crName,
            import_: new Import({ from: `${location}/${crName}` }),
            location,
            moduleBreadcrumbs
        });
    }
}
