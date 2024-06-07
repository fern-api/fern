import { FernWorkspace } from "@fern-api/workspace-loader";
import { RawSchemas } from "@fern-api/yaml-schema";
import { FernFileContext } from "../FernFileContext";
import { ExampleResolver } from "../resolvers/ExampleResolver";
import { TypeResolver } from "../resolvers/TypeResolver";
import { ExampleViolation } from "./exampleViolation";
import { validateTypeReferenceExample } from "./validateTypeReferenceExample";

export async function validateUndiscriminatedUnionExample({
    rawUnion,
    example,
    typeResolver,
    exampleResolver,
    file,
    workspace
}: {
    rawUnion: RawSchemas.UndiscriminatedUnionSchema;
    example: RawSchemas.ExampleTypeValueSchema;
    typeResolver: TypeResolver;
    exampleResolver: ExampleResolver;
    file: FernFileContext;
    workspace: FernWorkspace;
}): Promise<ExampleViolation[]> {
    const violations: ExampleViolation[] = [];
    for (const member of rawUnion.union) {
        const violationsForMember = await validateTypeReferenceExample({
            rawTypeReference: typeof member === "string" ? member : member.type,
            example,
            typeResolver,
            exampleResolver,
            file,
            workspace
        });
        if (violationsForMember.length === 0) {
            return [];
        } else if (violations.length === 0) {
            violations.push(...violationsForMember);
        }
    }
    return violations;
}
