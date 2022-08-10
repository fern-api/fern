import { IntermediateRepresentation } from "@fern-fern/ir-model";
import { WrapperDeclaration, WrapperName } from "@fern-typescript/commons-v2";
import { isEqual } from "lodash-es";
import { StringifiedFernFilepath, stringifyFernFilepath } from "./utils/stringifyFernFilepath";

export function constructWrapperDeclarations(
    intermediateRepresentation: IntermediateRepresentation
): WrapperDeclaration[] {
    const declarations: Record<StringifiedFernFilepath, WrapperDeclaration> = {};

    for (const service of intermediateRepresentation.services.http) {
        for (let index = 0; index < service.name.fernFilepath.length; index++) {
            const wrapped: WrapperName = {
                name: "_Client",
                fernFilepath: service.name.fernFilepath.slice(0, index + 1),
            };

            const fernFilepathOfWrapper = wrapped.fernFilepath.slice(0, -1);
            const wrapper: WrapperName = {
                name: fernFilepathOfWrapper.length === 0 ? "Client" : wrapped.name,
                fernFilepath: fernFilepathOfWrapper,
            };

            const declarationOfWrapper = (declarations[stringifyFernFilepath(wrapper.fernFilepath)] ??= {
                name: wrapper,
                wrappedServices: [],
                wrappedWrappers: [],
            });

            if (index === service.name.fernFilepath.length - 1) {
                declarationOfWrapper.wrappedServices.push(wrapped);
            } else if (!declarationOfWrapper.wrappedWrappers.some((wrapper) => isEqual(wrapper, wrapped))) {
                declarationOfWrapper.wrappedWrappers.push(wrapped);
            }
        }
    }

    return Object.values(declarations);
}
