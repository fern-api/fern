import { RawSchemas } from "@fern-api/fern-definition-schema";
import { validateFernWorkspace } from "@fern-api/fern-definition-validator";
import { AbsoluteFilePath, join, RelativeFilePath } from "@fern-api/fs-utils";
import { createMockTaskContext } from "@fern-api/task-context";
import { loadAPIWorkspace } from "@fern-api/workspace-loader";

const FIXTURE_DIR = join(
    AbsoluteFilePath.of(__dirname),
    RelativeFilePath.of("fixtures/global-header-inline-enum/fern")
);

const ENUM_NAME = "CreateConsentRequestPsuHttpMethod";

function getHeaderType(header: RawSchemas.HttpHeaderSchema | undefined): string | undefined {
    return typeof header === "string" ? header : header?.type;
}

describe("detected global header with an inline enum", () => {
    let headers: Record<string, RawSchemas.HttpHeaderSchema>;
    let packageTypes: Record<string, RawSchemas.TypeDeclarationSchema>;
    let violations: ReturnType<typeof validateFernWorkspace>;

    beforeAll(async () => {
        const context = createMockTaskContext();
        const workspace = await loadAPIWorkspace({
            absolutePathToWorkspace: FIXTURE_DIR,
            context,
            cliVersion: "0.0.0",
            workspaceName: "global-header-inline-enum"
        });
        if (!workspace.didSucceed) {
            throw new Error(`Failed to load fixture: ${JSON.stringify(workspace.failures)}`);
        }
        const fernWorkspace = await workspace.workspace.toFernWorkspace({ context });
        violations = validateFernWorkspace(fernWorkspace, context.logger);
        headers = fernWorkspace.definition.rootApiFile.contents.headers ?? {};
        packageTypes =
            fernWorkspace.definition.namedDefinitionFiles[RelativeFilePath.of("__package__.yml")]?.contents.types ?? {};
    }, 90_000);

    it("passes fern check", () => {
        expect(violations.filter((violation) => violation.severity === "fatal")).toEqual([]);
    });

    it("promotes the header and references the enum through the root package", () => {
        expect(getHeaderType(headers["PSU-Http-Method"])).toBe(`optional<root.${ENUM_NAME}>`);
    });

    it("declares the inline enum with its values", () => {
        const declaration = packageTypes[ENUM_NAME];
        if (declaration == null || typeof declaration === "string" || !("enum" in declaration)) {
            throw new Error(`Expected ${ENUM_NAME} enum declaration, got ${JSON.stringify(declaration)}`);
        }
        expect(declaration.enum.map((value) => (typeof value === "string" ? value : value.value))).toEqual([
            "GET",
            "POST",
            "PUT",
            "PATCH",
            "DELETE"
        ]);
    });
});
