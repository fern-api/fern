import { DeclaredTypeName } from "@fern-fern/ir-model";
import { upperCamelCase } from "../../../utils/upperCamelCase";

export function getGeneratedTypeName(typeName: DeclaredTypeName): string {
    return upperCamelCase(typeName.name);
}
