import { Referencer, swift } from "@fern-api/swift-codegen";
import { StructGenerator } from "./StructGenerator";

export interface AdditionalPropertiesMetadata {
    /**
     * The name of the property that will be used to store additional properties that are not explicitly defined in the schema.
     */
    propertyName: string;
    swiftType: swift.TypeReference;
}

export function computeAdditionalPropertiesMetadata(generatorArgs: StructGenerator.Args, referencer: Referencer) {
    const {
        constantPropertyDefinitions,
        dataPropertyDefinitions,
        additionalProperties: hasAdditionalProperties
    } = generatorArgs;

    if (!hasAdditionalProperties) {
        return null;
    }

    const otherPropertyNames = [
        ...constantPropertyDefinitions.map((p) => p.unsafeName),
        ...dataPropertyDefinitions.map((p) => p.unsafeName)
    ];
    const otherPropertyNamesSet = new Set(otherPropertyNames);
    let propertyName = "additionalProperties";
    while (otherPropertyNamesSet.has(propertyName)) {
        propertyName = "_" + propertyName;
    }
    return {
        propertyName,
        swiftType: swift.TypeReference.dictionary(
            referencer.referenceSwiftType("String"),
            referencer.referenceAsIsType("JSONValue")
        )
    };
}
