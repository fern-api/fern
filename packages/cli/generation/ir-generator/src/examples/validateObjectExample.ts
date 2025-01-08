import { keyBy } from "lodash-es";

import { FernWorkspace, getDefinitionFile } from "@fern-api/api-workspace-commons";
import { isPlainObject } from "@fern-api/core-utils";
import { RawSchemas } from "@fern-api/fern-definition-schema";

import { FernFileContext, constructFernFileContext } from "../FernFileContext";
import { ExampleResolver } from "../resolvers/ExampleResolver";
import { TypeResolver } from "../resolvers/TypeResolver";
import { getAllPropertiesForObject } from "../utils/getAllPropertiesForObject";
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
    example,
    breadcrumbs,
    depth
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
    breadcrumbs: string[];
    depth: number;
}): ExampleViolation[] {
    if (!isPlainObject(example)) {
        return getViolationsForMisshapenExample(example, "an object");
    }

    const violations: ExampleViolation[] = [];

    const allPropertiesForObject = getAllPropertiesForObject({
        typeName,
        objectDeclaration: rawObject,
        typeResolver,
        definitionFile: file.definitionFile,
        workspace,
        filepathOfDeclaration: file.relativeFilepath,
        smartCasing: false
    });

    const allPropertiesByWireKey = keyBy(allPropertiesForObject, (property) => property.wireKey);

    // ensure required properties are present, we treat unknown as optional
    const requiredProperties = allPropertiesForObject.filter(
        (property) => !property.isOptional && property.resolvedPropertyType._type !== "unknown"
    );
    for (const requiredProperty of requiredProperties) {
        // dont error on literal properties
        if (
            requiredProperty.resolvedPropertyType._type === "container" &&
            requiredProperty.resolvedPropertyType.container._type === "literal"
        ) {
            continue;
        }

        if (example[requiredProperty.wireKey] == null) {
            const propertyReference =
                breadcrumbs.length > 0
                    ? `${breadcrumbs.join(".")}.${requiredProperty.wireKey}`
                    : requiredProperty.wireKey;
            const message = `Example is missing required property "${propertyReference}"`;
            violations.push({
                message
            });
        }
    }

    // check properties on example
    for (const [exampleKey, exampleValue] of Object.entries(example)) {
        const propertyWithPath = allPropertiesByWireKey[exampleKey];
        if (rawObject["extra-properties"]) {
            continue;
        } else if (propertyWithPath == null) {
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
                    exampleResolver,
                    breadcrumbs: [...breadcrumbs, `${exampleKey}`],
                    depth: depth + 1
                })
            );
        }
    }

    return violations;
}
