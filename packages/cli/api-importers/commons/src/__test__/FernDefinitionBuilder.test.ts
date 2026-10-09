import { RawSchemas } from "@fern-api/fern-definition-schema";
import { RelativeFilePath } from "@fern-api/path-utils";

import { FernDefinitionBuilderImpl } from "../FernDefinitionBuilder.js";

const FILE = RelativeFilePath.of("errors.yml");

function addErrors(schemas: RawSchemas.ErrorDeclarationSchema[]): RawSchemas.ErrorDeclarationSchema | undefined {
    const builder = new FernDefinitionBuilderImpl(false);
    for (const schema of schemas) {
        builder.addError(FILE, { name: "BadRequestError", schema });
    }
    return builder.build().definitionFiles[FILE]?.errors?.["BadRequestError"];
}

describe("FernDefinitionBuilder.addError", () => {
    it("keeps the named type when every endpoint declares the same error body", () => {
        expect(
            addErrors([
                { "status-code": 400, type: "Error" },
                { "status-code": 400, type: "Error" }
            ])
        ).toEqual({
            "status-code": 400,
            type: "Error"
        });
    });

    // A shared error is decoded with a single type across every endpoint that declares it, so a
    // body type only observed on one endpoint must not be claimed for the others: the endpoints
    // that return something else would fail to decode and lose their specific error type at
    // runtime.
    it("falls back to unknown when another endpoint declares the same error without a body", () => {
        expect(addErrors([{ "status-code": 400, type: "Error" }, { "status-code": 400 }])).toEqual({
            "status-code": 400,
            type: "unknown"
        });
    });

    it("falls back to unknown when another endpoint declares the same error as unknown", () => {
        expect(
            addErrors([
                { "status-code": 400, type: "unknown" },
                { "status-code": 400, type: "Error" }
            ])
        ).toEqual({
            "status-code": 400,
            type: "unknown"
        });
    });

    it("falls back to unknown when two endpoints declare conflicting error bodies", () => {
        expect(
            addErrors([
                { "status-code": 400, type: "Error" },
                { "status-code": 400, type: "OtherError" }
            ])
        ).toEqual({
            "status-code": 400,
            type: "unknown"
        });
    });

    it("stays unknown once a conflict was detected, regardless of declaration order", () => {
        expect(
            addErrors([
                { "status-code": 400, type: "Error" },
                { "status-code": 400, type: "OtherError" },
                { "status-code": 400, type: "Error" }
            ])
        ).toEqual({
            "status-code": 400,
            type: "unknown"
        });
    });

    it("keeps unknown when no endpoint declares an error body type", () => {
        expect(addErrors([{ "status-code": 400, type: "unknown" }, { "status-code": 400 }])).toEqual({
            "status-code": 400,
            type: "unknown"
        });
    });
});
