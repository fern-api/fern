import {
    EnumTypeDeclaration,
    ObjectTypeDeclaration,
    UnionTypeDeclaration
} from "@fern-fern/ir-sdk/api/resources/types/types";
import { nameRegistry } from "..";
import { AbstractCsharpGeneratorContext } from "../context/AbstractCsharpGeneratorContext";
import { freezeClassReferences } from "../csharp";
import { BaseCsharpCustomConfigSchema } from "../custom-config/BaseCsharpCustomConfigSchema";
import { System } from "../utils/builtIn";

/**
 * this function goes thru the motions of figuring out what the names of everything will be generated as
 * including namespaces and types, and ensures that there are not conflicts or ambiguities
 *
 * After this, the csharp.classReference() function will not create instances that aren't already known
 *
 */
export function precalculate(context: AbstractCsharpGeneratorContext<BaseCsharpCustomConfigSchema>) {
    // start with the models
    nameRegistry.trackType(System.Text.Json.Serialization.IJsonOnDeserialized);
    nameRegistry.trackType(System.Serializable);
    nameRegistry.trackType(System.Text.Json.Serialization.JsonPropertyName)

    for (const [typeId, typeDeclaration] of Object.entries(context.ir.types)) {
        if (context.protobufResolver.isWellKnownProtobufType(typeId)) {
            // The well-known Protobuf types are generated separately.
            continue;
        }

        const result = typeDeclaration.shape._visit({
            alias: () => undefined,
            undiscriminatedUnion: () => undefined,
            _other: () => undefined,

            enum: (etd: EnumTypeDeclaration) => {
                //
            },
            object: (otd: ObjectTypeDeclaration) => {
                // generate a class reference for the typedeclaration
                nameRegistry.trackType( context.csharpTypeMapper.convertToClassReference(typeDeclaration.name));

                for( const property of otd.properties) {
                  
                    nameRegistry.trackType( context.csharpTypeMapper.convertToClassReference({named: property.valueType}));
                }
            },
            union: (utd: UnionTypeDeclaration) => {
                //
            }
        });
        if (result !== undefined) {
            throw new Error(`Unexpected result from typeDeclaration.shape._visit: ${result}`);
        }
    }
    freezeClassReferences();
}
