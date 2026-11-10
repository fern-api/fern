import { RawSchemas } from "@fern-api/fern-definition-schema";
import { validateFernWorkspace } from "@fern-api/fern-definition-validator";
import { AbsoluteFilePath, join, RelativeFilePath } from "@fern-api/fs-utils";
import { createMockTaskContext } from "@fern-api/task-context";
import { loadAPIWorkspace } from "@fern-api/workspace-loader";

const FIXTURE_DIR = join(
    AbsoluteFilePath.of(__dirname),
    RelativeFilePath.of("fixtures/referenced-primitive-defaults/fern")
);

function getDefault(property: RawSchemas.ObjectPropertySchema | undefined): unknown {
    return property != null && typeof property !== "string" ? property.default : undefined;
}

describe("referenced primitive defaults", () => {
    let properties: Record<string, RawSchemas.ObjectPropertySchema>;
    let queryParameters: Record<string, RawSchemas.HttpQueryParameterSchema>;
    let violations: ReturnType<typeof validateFernWorkspace>;

    beforeAll(async () => {
        const context = createMockTaskContext();
        const workspace = await loadAPIWorkspace({
            absolutePathToWorkspace: FIXTURE_DIR,
            context,
            cliVersion: "0.0.0",
            workspaceName: "referenced-primitive-defaults"
        });
        if (!workspace.didSucceed) {
            throw new Error(`Failed to load fixture: ${JSON.stringify(workspace.failures)}`);
        }
        const fernWorkspace = await workspace.workspace.toFernWorkspace({ context });
        violations = validateFernWorkspace(fernWorkspace, context.logger);

        const packageFile = fernWorkspace.definition.namedDefinitionFiles[RelativeFilePath.of("__package__.yml")];
        const values = packageFile?.contents.types?.Values;
        if (values == null || typeof values === "string" || !("properties" in values) || values.properties == null) {
            throw new Error(`Expected Values object, got ${JSON.stringify(values)}`);
        }
        properties = values.properties;
        const request = packageFile?.contents.service?.endpoints.getLogs?.request;
        if (request == null || typeof request === "string" || request["query-parameters"] == null) {
            throw new Error(`Expected getLogs query parameters, got ${JSON.stringify(request)}`);
        }
        queryParameters = request["query-parameters"];
    }, 90_000);

    it("passes fern check", () => {
        expect(violations.filter((violation) => violation.severity === "fatal")).toEqual([]);
    });

    it("keeps well-typed defaults through references and alias chains", () => {
        expect(getDefault(properties.disabled)).toBe(false);
        expect(getDefault(properties.limit)).toBe(25);
        expect(getDefault(properties.label)).toBe("");
        expect(getDefault(properties.alias)).toBe(false);
        expect(getDefault(queryParameters.limit)).toBe(25);
    });

    it("drops defaults that do not match the primitive type", () => {
        expect(getDefault(properties.mistyped)).toBeUndefined();
        expect(getDefault(queryParameters.tailLines)).toBeUndefined();
    });

    it("does not apply element defaults to collections", () => {
        expect(getDefault(properties.list)).toBeUndefined();
        expect(getDefault(properties.map)).toBeUndefined();
    });
});
