import { isPlainObject } from "@fern-api/core-utils";
import { FernWorkspace, getDefinitionFile } from "@fern-api/workspace-loader";
import { RawSchemas } from "@fern-api/yaml-schema";
import { keyBy } from "lodash-es";
import { constructFernFileContext, FernFileContext } from "../FernFileContext";
import { ExampleResolver } from "../resolvers/ExampleResolver";
import { TypeResolver } from "../resolvers/TypeResolver";
import { convertObjectPropertyWithPathToString, getAllPropertiesForObject } from "../utils/getAllPropertiesForObject";
import { ExampleViolation } from "./exampleViolation";
import { getViolationsForMisshapenExample } from "./getViolationsForMisshapenExample";
import { validateTypeReferenceExample } from "./validateTypeReferenceExample";

export function validateObjectExample({
    typeName,
    typeNameForBreadcrumb,
    rawObject,
    file,
    typeResolver,
    exampleResolver,
    workspace,
    example
}: {
    // undefined for inline requests
    typeName: string | undefined;
    typeNameForBreadcrumb: string;
    rawObject: RawSchemas.ObjectSchema;
    file: FernFileContext;
    example: RawSchemas.ExampleTypeValueSchema;
    typeResolver: TypeResolver;
    exampleResolver: ExampleResolver;
    workspace: FernWorkspace;
}): ExampleViolation[] {
    if (!isPlainObject(example)) {
        return getViolationsForMisshapenExample(example, "an object");
    }

    const violations: ExampleViolation[] = [];

    const { properties: allPropertiesForObject } = getAllPropertiesForObject({
        typeName,
        objectDeclaration: rawObject,
        typeResolver,
        definitionFile: file.definitionFile,
        workspace,
        filepathOfDeclaration: file.relativeFilepath
    });

    const allPropertiesByWireKey = keyBy(allPropertiesForObject, (property) => property.wireKey);

    // ensure required properties are present
    const requiredProperties = allPropertiesForObject.filter((property) => !property.isOptional);
    for (const requiredProperty of requiredProperties) {
        if (example[requiredProperty.wireKey] == null) {
            let message = `Example is missing required property "${requiredProperty.wireKey}"`;
            if (requiredProperty.path.length > 0) {
                message +=
                    ". " +
                    convertObjectPropertyWithPathToString({
                        property: requiredProperty,
                        prefixBreadcrumbs: [typeNameForBreadcrumb]
                    });
            }
            violations.push({
                message
            });
        }
    }

    // check properties on example
    for (const [exampleKey, exampleValue] of Object.entries(example)) {
        const propertyWithPath = allPropertiesByWireKey[exampleKey];
        if (propertyWithPath == null) {
            violations.push({
                message: `Unexpected property "${exampleKey}"`
            });
        } else {
            const definitionFile = getDefinitionFile(workspace, propertyWithPath.filepathOfDeclaration);
            if (definitionFile == null) {
                throw new Error("Service file does not exist for property: " + propertyWithPath.wireKey);
            }
            violations.push(
                ...validateTypeReferenceExample({
                    rawTypeReference: propertyWithPath.propertyType,
                    example: exampleValue,
                    file: constructFernFileContext({
                        relativeFilepath: propertyWithPath.filepathOfDeclaration,
                        definitionFile,
                        casingsGenerator: file.casingsGenerator,
                        rootApiFile: workspace.definition.rootApiFile.contents
                    }),
                    workspace,
                    typeResolver,
                    exampleResolver
                })
            );
        }
    }

    return violations;
}
