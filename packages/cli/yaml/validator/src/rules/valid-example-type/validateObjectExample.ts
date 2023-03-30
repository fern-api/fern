import { isPlainObject } from "@fern-api/core-utils";
import { constructFernFileContext, ExampleResolver, FernFileContext, TypeResolver } from "@fern-api/ir-generator";
import { FernWorkspace, getDefinitionFile } from "@fern-api/workspace-loader";
import { RawSchemas } from "@fern-api/yaml-schema";
import { keyBy } from "lodash-es";
import { RuleViolation } from "../../Rule";
import {
    convertObjectPropertyWithPathToString,
    getAllPropertiesForObject,
} from "../../utils/getAllPropertiesForObject";
import { getRuleViolationsForMisshapenExample } from "./getRuleViolationsForMisshapenExample";
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
}): RuleViolation[] {
    if (!isPlainObject(example)) {
        return getRuleViolationsForMisshapenExample(example, "an object");
    }

    const violations: RuleViolation[] = [];

    const allPropertiesForObject = getAllPropertiesForObject({
        typeName,
        objectDeclaration: rawObject,
        typeResolver,
        definitionFile: file.definitionFile,
        workspace,
        filepathOfDeclaration: file.relativeFilepath,
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
                        prefixBreadcrumbs: [typeNameForBreadcrumb],
                    });
            }
            violations.push({
                severity: "error",
                message,
            });
        }
    }

    // check properties on example
    for (const [exampleKey, exampleValue] of Object.entries(example)) {
        const propertyWithPath = allPropertiesByWireKey[exampleKey];
        if (propertyWithPath == null) {
            violations.push({
                severity: "error",
                message: `Unexpected property "${exampleKey}"`,
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
                        rootApiFile: workspace.definition.rootApiFile.contents,
                    }),
                    workspace,
                    typeResolver,
                    exampleResolver,
                })
            );
        }
    }

    return violations;
}
