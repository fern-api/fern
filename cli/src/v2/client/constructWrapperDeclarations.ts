import { IntermediateRepresentation } from "@fern-fern/ir-model";
import { WrapperDeclaration, WrapperName } from "@fern-typescript/commons-v2";
import { isEqual } from "lodash-es";
import { StringifiedFernFilepath, stringifyFernFilepath } from "./utils/stringifyFernFilepath";

const WRAPPER_NAME = "Client";

export function constructWrapperDeclarations(
    intermediateRepresentation: IntermediateRepresentation
): WrapperDeclaration[] {
    const declarations: Record<StringifiedFernFilepath, WrapperDeclaration> = {};

    for (const service of intermediateRepresentation.services.http) {
        for (let index = 0; index < service.name.fernFilepath.length; index++) {
            const nameOfWrapped: WrapperName = {
                name: WRAPPER_NAME,
                fernFilepath: service.name.fernFilepath.slice(0, index + 1),
            };

            const nameOfWrapper: WrapperName = {
                name: WRAPPER_NAME,
                fernFilepath: nameOfWrapped.fernFilepath.slice(0, -1),
            };

            const declarationOfWrapper = (declarations[stringifyFernFilepath(nameOfWrapper.fernFilepath)] ??= {
                name: nameOfWrapper,
                wrappedServices: [],
                wrappedWrappers: [],
            });

            if (index === service.name.fernFilepath.length - 1) {
                declarationOfWrapper.wrappedServices.push(nameOfWrapped);
            } else if (!declarationOfWrapper.wrappedWrappers.some((wrapper) => isEqual(wrapper, nameOfWrapped))) {
                declarationOfWrapper.wrappedWrappers.push(nameOfWrapped);
            }
        }
    }

    return Object.values(declarations);
}
