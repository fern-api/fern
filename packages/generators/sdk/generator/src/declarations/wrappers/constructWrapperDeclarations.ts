import { IntermediateRepresentation } from "@fern-fern/ir-model/ir";
import { WrapperDeclaration, WrapperName } from "@fern-typescript/commons-v2";
import { isEqual } from "lodash-es";
import { StringifiedFernFilepath, stringifyFernFilepath } from "../utils/stringifyFernFilepath";

const ROOT_WRAPPER_NAME = "Client";
const NON_ROOT_WRAPPER_NAME = "Wrapper";

export function constructWrapperDeclarations(
    intermediateRepresentation: IntermediateRepresentation
): WrapperDeclaration[] {
    const declarations: Record<StringifiedFernFilepath, WrapperDeclaration> = {};

    for (const service of intermediateRepresentation.services.http) {
        for (const [index, fernFilepathPart] of service.name.fernFilepath.entries()) {
            const isRootWrapper = index === 0;
            const wrapper: WrapperName = {
                name: isRootWrapper ? ROOT_WRAPPER_NAME : NON_ROOT_WRAPPER_NAME,
                isRootWrapper,
                fernFilepath: service.name.fernFilepath.slice(0, index),
            };

            const declarationOfWrapper = (declarations[stringifyFernFilepath(wrapper.fernFilepath)] ??= {
                name: wrapper,
                wrappedServices: [],
                wrappedWrappers: [],
            });

            if (index === service.name.fernFilepath.length - 1) {
                declarationOfWrapper.wrappedServices.push(service.name);
            } else {
                const wrapped: WrapperName = {
                    name: NON_ROOT_WRAPPER_NAME,
                    isRootWrapper: false,
                    fernFilepath: [...wrapper.fernFilepath, fernFilepathPart],
                };
                if (!declarationOfWrapper.wrappedWrappers.some((wrapper) => isEqual(wrapper, wrapped))) {
                    declarationOfWrapper.wrappedWrappers.push(wrapped);
                }
            }
        }
    }

    return Object.values(declarations);
}
