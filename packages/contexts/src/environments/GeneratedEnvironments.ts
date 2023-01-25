import { EnvironmentBaseUrlId } from "@fern-fern/ir-model/environment";
import { ts } from "ts-morph";
import { GeneratedFile } from "../commons/GeneratedFile";
import { EnvironmentsContext } from "./EnvironmentsContext";

export interface GeneratedEnvironments extends GeneratedFile<EnvironmentsContext> {
    hasDefaultEnvironment: () => boolean;
    getReferenceToDefaultEnvironment: (context: EnvironmentsContext) => ts.Expression | undefined;
    getTypeForUserSuppliedEnvironment: (context: EnvironmentsContext) => ts.TypeNode;
    getReferenceToEnvironmentUrl: (args: {
        referenceToEnvironmentValue: ts.Expression;
        baseUrlId: EnvironmentBaseUrlId | undefined;
    }) => ts.Expression;
}
