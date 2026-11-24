import { RawSchemas } from "@fern-api/fern-definition-schema";
import { AbsoluteFilePath, join, RelativeFilePath } from "@fern-api/fs-utils";
import { createMockTaskContext } from "@fern-api/task-context";
import { loadAPIWorkspace } from "@fern-api/workspace-loader";

const FIXTURE_DIR = join(AbsoluteFilePath.of(__dirname), RelativeFilePath.of("fixtures/global-header-threshold/fern"));

function getHeaderType(header: RawSchemas.HttpHeaderSchema | undefined): string | undefined {
    return typeof header === "string" ? header : header?.type;
}

describe("detected global headers at the 75% threshold (4 endpoints)", () => {
    let headers: Record<string, RawSchemas.HttpHeaderSchema>;

    beforeAll(async () => {
        const context = createMockTaskContext();
        const workspace = await loadAPIWorkspace({
            absolutePathToWorkspace: FIXTURE_DIR,
            context,
            cliVersion: "0.0.0",
            workspaceName: "global-header-threshold"
        });
        if (!workspace.didSucceed) {
            throw new Error(`Failed to load fixture: ${JSON.stringify(workspace.failures)}`);
        }
        const fernWorkspace = await workspace.workspace.toFernWorkspace({ context });
        headers = fernWorkspace.definition.rootApiFile.contents.headers ?? {};
    }, 90_000);

    it("keeps a header that is required on every endpoint required", () => {
        expect(getHeaderType(headers["X-Always"])).toBe("string");
    });

    it("promotes a required header found on 3 of 4 endpoints as optional", () => {
        expect(getHeaderType(headers["X-Mostly-Required"])).toBe("optional<string>");
    });

    it("promotes an optional header found on exactly 3 of 4 endpoints", () => {
        expect(getHeaderType(headers["X-Mostly-Optional"])).toBe("optional<string>");
    });

    it("does not promote a header found on 2 of 4 endpoints", () => {
        expect(headers["X-Sometimes"]).toBeUndefined();
    });

    it("never promotes the Authorization header", () => {
        expect(Object.keys(headers).map((name) => name.toLowerCase())).not.toContain("authorization");
    });
});
