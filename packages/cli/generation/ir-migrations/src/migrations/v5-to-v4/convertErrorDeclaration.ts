import { IrVersions } from "../../ir-versions";
import { TypeReferenceResolver } from "./TypeReferenceResolver";
import { convertFernFilepathV1, convertFernFilepathV2 } from "./convertFernFilepath";
import { convertNameAndWireValueToV2, convertNameToV1, convertNameToV2 } from "./convertName";
import { convertTypeReference } from "./convertTypeReference";

export function convertErrorDeclaration({
    errorDeclaration,
    errorDiscriminationStrategy,
    typeReferenceResolver
}: {
    errorDeclaration: IrVersions.V5.errors.ErrorDeclaration;
    errorDiscriminationStrategy: IrVersions.V5.ir.ErrorDiscriminationStrategy;
    typeReferenceResolver: TypeReferenceResolver;
}): IrVersions.V4.errors.ErrorDeclaration {
    const typeV2 =
        errorDeclaration.type != null
            ? IrVersions.V4.types.Type.alias({
                  aliasOf: convertTypeReference(errorDeclaration.type),
                  resolvedType: typeReferenceResolver.resolveTypeReference(errorDeclaration.type)
              })
            : undefined;
    return {
        docs: errorDeclaration.docs,
        name: {
            name: errorDeclaration.name.name.originalName,
            nameV2: convertNameToV1(errorDeclaration.name.name),
            nameV3: convertNameToV2(errorDeclaration.name.name),
            fernFilepath: convertFernFilepathV1(errorDeclaration.name.fernFilepath),
            fernFilepathV2: convertFernFilepathV2(errorDeclaration.name.fernFilepath)
        },
        discriminantValueV2: convertNameAndWireValueToV2(errorDeclaration.discriminantValue),
        discriminantValueV3:
            IrVersions.V5.ir.ErrorDiscriminationStrategy._visit<IrVersions.V4.errors.ErrorDeclarationDiscriminantValue>(
                errorDiscriminationStrategy,
                {
                    statusCode: IrVersions.V4.errors.ErrorDeclarationDiscriminantValue.statusCode,
                    property: (property) =>
                        IrVersions.V4.errors.ErrorDeclarationDiscriminantValue.property(
                            convertNameAndWireValueToV2(property.contentProperty)
                        ),
                    _unknown: () => {
                        throw new Error("Unknown ErrorDiscriminationStrategy: " + errorDiscriminationStrategy.type);
                    }
                }
            ),
        discriminantValueV4: convertNameAndWireValueToV2(errorDeclaration.discriminantValue),
        type:
            typeV2 ??
            IrVersions.V4.types.Type.alias({
                aliasOf: IrVersions.V4.types.TypeReference.void(),
                resolvedType: IrVersions.V4.types.ResolvedTypeReference.void()
            }),
        typeV2,
        typeV3: errorDeclaration.type != null ? convertTypeReference(errorDeclaration.type) : errorDeclaration.type,
        http: {
            statusCode: errorDeclaration.statusCode
        },
        statusCode: errorDeclaration.statusCode
    };
}
