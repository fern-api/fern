import { isPlainObject } from "@fern-api/core-utils";
import { FernWorkspace, getDefinitionFile } from "@fern-api/workspace-loader";
import { RawSchemas } from "@fern-api/fern-definition-schema";
import { keyBy } from "lodash-es";
import { constructFernFileContext, FernFileContext } from "../FernFileContext";
import { ExampleResolver } from "../resolvers/ExampleResolver";
import { TypeResolver } from "../resolvers/TypeResolver";
import { getAllPropertiesForObject } from "../utils/getAllPropertiesForObject";
import { ExampleViolation } from "./exampleViolation";
import { getViolationsForMisshapenExample } from "./getViolationsForMisshapenExample";
import { validateTypeReferenceExample } from "./validateTypeReferenceExample";
import { validateObjectProperties } from "./validateObjectProperties";

export function validateObjectExample({
    typeName,
    typeNameForBreadcrumb,
    rawObject,
    file,
    typeResolver,
    exampleResolver,
    workspace,
    example,
    breadcrumbs
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
}): ExampleViolation[] {
    return validateObjectProperties({
        typeName,
        objectProperties: rawObject.properties,
        extendedTypes: rawObject.extends,
        file,
        example,
        typeResolver,
        exampleResolver,
        workspace,
        breadcrumbs
    });
}
