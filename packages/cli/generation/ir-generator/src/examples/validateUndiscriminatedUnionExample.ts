import { FernWorkspace } from "@fern-api/workspace-loader";
import { RawSchemas } from "@fern-api/yaml-schema";
import { FernFileContext } from "../FernFileContext";
import { ExampleResolver } from "../resolvers/ExampleResolver";
import { TypeResolver } from "../resolvers/TypeResolver";
import { ExampleViolation } from "./exampleViolation";
import { validateTypeReferenceExample } from "./validateTypeReferenceExample";

export function validateUndiscriminatedUnionExample({
    rawUnion,
    example,
    typeResolver,
    exampleResolver,
    file,
    workspace,
    breadcrumbs
}: {
    rawUnion: RawSchemas.UndiscriminatedUnionSchema;
    example: RawSchemas.ExampleTypeValueSchema;
    typeResolver: TypeResolver;
    exampleResolver: ExampleResolver;
    file: FernFileContext;
    workspace: FernWorkspace;
    breadcrumbs: string[];
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
            breadcrumbs
        });
        if (violationsForMember.length === 0) {
            return [];
        } else if (violations.length === 0) {
            violations.push(...violationsForMember);
        }
    }
    return violations;
}
