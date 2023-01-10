import { isPlainObject } from "@fern-api/core-utils";
import { constructFernFileContext, ExampleResolver, FernFileContext, TypeResolver } from "@fern-api/ir-generator";
import { Workspace } from "@fern-api/workspace-loader";
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
    workspace: Workspace;
}): RuleViolation[] {
    if (!isPlainObject(example)) {
        return getRuleViolationsForMisshapenExample(example, "an object");
    }

    const violations: RuleViolation[] = [];

    const allPropertiesForObject = getAllPropertiesForObject({
        typeName,
        objectDeclaration: rawObject,
        typeResolver,
        serviceFile: file.serviceFile,
        workspace,
        filepathOfDeclaration: file.relativeFilepath,
    });

    const allPropertiesByWireKey = keyBy(allPropertiesForObject, (property) => property.wireKey);

    // ensure required properties are present
    const requiredProperties = allPropertiesForObject.filter(
        (property) => property.isOptional != null && !property.isOptional
    );
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
            const serviceFile = workspace.serviceFiles[propertyWithPath.filepathOfDeclaration];
            if (serviceFile == null) {
                throw new Error("Service file does not exist for property: " + propertyWithPath.wireKey);
            }
            violations.push(
                ...validateTypeReferenceExample({
                    rawTypeReference: propertyWithPath.propertyType,
                    example: exampleValue,
                    file: constructFernFileContext({
                        relativeFilepath: propertyWithPath.filepathOfDeclaration,
                        serviceFile,
                        casingsGenerator: file.casingsGenerator,
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
