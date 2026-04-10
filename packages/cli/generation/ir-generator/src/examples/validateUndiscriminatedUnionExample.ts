import { FernWorkspace } from "@fern-api/api-workspace-commons";
import { RawSchemas } from "@fern-api/fern-definition-schema";

import { FernFileContext } from "../FernFileContext.js";
import { ExampleResolver } from "../resolvers/ExampleResolver.js";
import { TypeResolver } from "../resolvers/TypeResolver.js";
import { ExampleViolation } from "./exampleViolation.js";
import { validateTypeReferenceExample } from "./validateTypeReferenceExample.js";

export function validateUndiscriminatedUnionExample({
    rawUnion,
    example,
    typeResolver,
    exampleResolver,
    file,
    workspace,
    breadcrumbs,
    depth
}: {
    rawUnion: RawSchemas.UndiscriminatedUnionSchema;
    example: RawSchemas.ExampleTypeValueSchema;
    typeResolver: TypeResolver;
    exampleResolver: ExampleResolver;
    file: FernFileContext;
    workspace: FernWorkspace;
    breadcrumbs: string[];
    depth: number;
}): ExampleViolation[] {
    const violations: ExampleViolation[] = [];
    for (const member of rawUnion.union) {
        const violationsForMember = validateTypeReferenceExample({
            rawTypeReference: typeof member === "string" ? member : member.type,
            example,
            typeResolver,
            exampleResolver,
            file,
            workspace,
            breadcrumbs,
            depth: depth + 1
        });
        if (violationsForMember.length === 0) {
            return [];
        } else if (violations.length === 0) {
            violations.push(...violationsForMember);
        }
    }
    return violations;
}
