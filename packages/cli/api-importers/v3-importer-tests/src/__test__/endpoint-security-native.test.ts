import { SourceResolverImpl } from "@fern-api/cli-source-resolver";
import { AbsoluteFilePath, join, RelativeFilePath } from "@fern-api/fs-utils";
import { generateIntermediateRepresentation } from "@fern-api/ir-generator";
import { getOriginalName } from "@fern-api/ir-utils";
import { OSSWorkspace } from "@fern-api/lazy-fern-workspace";
import { createMockTaskContext } from "@fern-api/task-context";
import { loadAPIWorkspace } from "@fern-api/workspace-loader";
import { describe, expect, it } from "vitest";

async function getIR(fixture: string, parser: string) {
    const context = createMockTaskContext();
    const result = await loadAPIWorkspace({
        absolutePathToWorkspace: join(AbsoluteFilePath.of(__dirname), RelativeFilePath.of(`fixtures/${fixture}/fern`)),
        context,
        cliVersion: "0.0.0",
        workspaceName: fixture
    });
    if (!result.didSucceed || !(result.workspace instanceof OSSWorkspace)) {
        throw new Error(`Unable to load ${fixture}`);
    }
    if (parser === "direct") {
        return result.workspace.getIntermediateRepresentation({
            context,
            audiences: { type: "all" },
            enableUniqueErrorsPerEndpoint: false,
            generateV1Examples: false,
            logWarnings: false
        });
    }
    const workspace = await result.workspace.toFernWorkspace({ context });
    return generateIntermediateRepresentation({
        workspace,
        generationLanguage: undefined,
        audiences: { type: "all" },
        keywords: undefined,
        smartCasing: true,
        exampleGeneration: { disabled: true },
        readme: undefined,
        version: undefined,
        packageName: undefined,
        context,
        sourceResolver: new SourceResolverImpl(context, workspace)
    });
}

describe.each(["sdk", "direct"])("native endpoint security through the %s importer", (parser) => {
    it.each([
        "endpoint-security-native",
        "endpoint-security-native-object",
        "endpoint-security-native-override"
    ])("preserves scheme definitions and operation requirements for %s", async (fixture) => {
        const ir = await getIR(fixture, parser);
        expect(ir.auth.requirement).toBe("ENDPOINT_SECURITY");
        expect(ir.auth.schemes.map((scheme) => scheme.key).sort()).toEqual(["Bearer", "PublicHeader", "SecretHeader"]);
        expect(ir.headers).toEqual([]);
        const header = ir.auth.schemes.find((scheme) => scheme.key === "SecretHeader");
        expect(header).toMatchObject({
            type: "header",
            name: { wireValue: fixture.endsWith("override") ? "X-Overridden-Secret" : "X-Secret-Key" }
        });
        const endpoints = Object.fromEntries(
            Object.values(ir.services).flatMap((service) =>
                service.endpoints.map((endpoint) => [getOriginalName(endpoint.name), endpoint])
            )
        );
        expect(endpoints.inherited).toMatchObject({ auth: true, security: [{ Bearer: [] }] });
        expect(endpoints.same).toMatchObject({ auth: true, security: [{ Bearer: [] }] });
        expect(endpoints.anonymous?.auth).toBe(false);
        expect(endpoints.anonymous?.security ?? []).toEqual([]);
        expect(endpoints.either).toMatchObject({ auth: true, security: [{ SecretHeader: [] }, { PublicHeader: [] }] });
        expect(endpoints.both).toMatchObject({ auth: true, security: [{ SecretHeader: [], PublicHeader: [] }] });
    }, 90_000);
});
