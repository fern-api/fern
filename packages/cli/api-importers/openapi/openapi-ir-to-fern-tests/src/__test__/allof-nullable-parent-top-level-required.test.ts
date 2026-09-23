import { RawSchemas } from "@fern-api/fern-definition-schema";
import { validateFernWorkspace } from "@fern-api/fern-definition-validator";
import { AbsoluteFilePath, join, RelativeFilePath } from "@fern-api/fs-utils";
import { createMockTaskContext } from "@fern-api/task-context";
import { loadAPIWorkspace } from "@fern-api/workspace-loader";

const FIXTURE_DIR = join(
    AbsoluteFilePath.of(__dirname),
    RelativeFilePath.of("fixtures/allof-nullable-parent-top-level-required/fern")
);

function isObjectSchema(schema: RawSchemas.TypeDeclarationSchema | undefined): schema is RawSchemas.ObjectSchema {
    return schema != null && typeof schema === "object" && "properties" in schema;
}

function getObjectType(types: Record<string, RawSchemas.TypeDeclarationSchema>, name: string): RawSchemas.ObjectSchema {
    const type = types[name];
    if (!isObjectSchema(type)) {
        throw new Error(`${name} should be an object, got ${JSON.stringify(type)}`);
    }
    return type;
}

describe("allOf with nullable $ref parent and top-level required", () => {
    let types: Record<string, RawSchemas.TypeDeclarationSchema>;
    let requestProperties: Record<string, RawSchemas.ObjectPropertySchema>;
    let violations: ReturnType<typeof validateFernWorkspace>;

    beforeAll(async () => {
        const context = createMockTaskContext();
        const workspace = await loadAPIWorkspace({
            absolutePathToWorkspace: FIXTURE_DIR,
            context,
            cliVersion: "0.0.0",
            workspaceName: "allof-nullable-parent-top-level-required"
        });
        if (!workspace.didSucceed) {
            throw new Error(`Failed to load fixture: ${JSON.stringify(workspace.failures)}`);
        }
        const fernWorkspace = await workspace.workspace.toFernWorkspace({ context });
        violations = validateFernWorkspace(fernWorkspace, context.logger);

        const packageFile = fernWorkspace.definition.namedDefinitionFiles[RelativeFilePath.of("__package__.yml")];
        if (packageFile == null) {
            throw new Error("Expected __package__.yml in definition");
        }
        types = packageFile.contents.types ?? {};
        const endpoint = packageFile.contents.service?.endpoints.createPaymentSchedule;
        const body =
            endpoint?.request != null && typeof endpoint.request !== "string" ? endpoint.request.body : undefined;
        if (body == null || typeof body === "string" || !("properties" in body) || body.properties == null) {
            throw new Error(`Expected inlined request body properties, got ${JSON.stringify(endpoint?.request)}`);
        }
        requestProperties = body.properties;
    }, 90_000);

    it("passes fern check (no duplicate properties between the type and its extends)", () => {
        expect(violations.filter((violation) => violation.severity === "fatal")).toEqual([]);
    });

    it("inlines the nullable parent instead of extending it", () => {
        const get = getObjectType(types, "ExternalPaymentScheduleGet");
        expect(get.extends).toBeUndefined();
    });

    it("marks parent-defined properties required by the schema-level required list as required", () => {
        const get = getObjectType(types, "ExternalPaymentScheduleGet");
        expect(get.properties?.adjusted_start_date).toBe("nullable<date>");
        expect(get.properties?.end_date).toBe("nullable<date>");
        expect(get.properties?.start_date).toBe("date");
        expect(get.properties?.interval_execution_day).toBe("integer");
        expect(get.properties?.interval).toBe("PaymentScheduleInterval");
    });

    it("leaves properties required in no branch optional", () => {
        const get = getObjectType(types, "ExternalPaymentScheduleGet");
        expect(get.properties?.description).toBe("optional<string>");
        const base = getObjectType(types, "ExternalPaymentScheduleBase");
        expect(base.properties?.start_date).toBe("optional<date>");
        expect(base.properties?.adjusted_start_date).toBe("optional<nullable<date>>");
    });

    it("applies the same rule to a request body whose parent is the nullable schema", () => {
        expect(requestProperties.start_date).toBe("date");
        expect(requestProperties.interval).toBe("PaymentScheduleInterval");
        expect(requestProperties.interval_execution_day).toBe("integer");
        expect(requestProperties.end_date).toBe("optional<nullable<date>>");
        expect(requestProperties.adjusted_start_date).toBe("optional<nullable<date>>");
        expect(requestProperties.description).toBe("optional<string>");
    });
});
