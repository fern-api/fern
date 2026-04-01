/* eslint-disable jest/expect-expect */
/* eslint-disable jest/valid-describe-callback */
/* eslint-disable @typescript-eslint/no-misused-promises */

import { AbsoluteFilePath, join, RelativeFilePath } from "@fern-api/fs-utils";
import { getOriginalName } from "@fern-api/ir-utils";
import { createMockTaskContext } from "@fern-api/task-context";
import { AbstractAPIWorkspace } from "@fern-api/workspace-loader";
import { readdirSync } from "fs";
import path from "path";

import { loadApisOrThrow } from "../../loadApisOrThrow.js";
import { generateAndSnapshotIR, generateAndSnapshotIRFromPath, generateIRFromPath } from "./generateAndSnapshotIR.js";

const IR_DIR = path.join(__dirname, "irs");

it("audiences", async () => {
    const AUDIENCES_DIR = path.join(__dirname, "fixtures/audiences/fern");
    await generateAndSnapshotIRFromPath({
        absolutePathToIr: AbsoluteFilePath.of(IR_DIR),
        absolutePathToWorkspace: AbsoluteFilePath.of(AUDIENCES_DIR),
        audiences: { type: "select", audiences: ["external"] },
        workspaceName: "audiences"
    });
});

it("environments no audiences", async () => {
    const AUDIENCES_DIR = path.join(__dirname, "fixtures/audiences/fern");
    await generateAndSnapshotIRFromPath({
        absolutePathToIr: AbsoluteFilePath.of(IR_DIR),
        absolutePathToWorkspace: AbsoluteFilePath.of(AUDIENCES_DIR),
        audiences: { type: "all" },
        workspaceName: "environmentAudiences"
    });
});

it("environments no audiences on environments but all hack", async () => {
    const AUDIENCES_DIR = path.join(__dirname, "fixtures/audiences/fern-hack-override-environment-audience");
    await generateAndSnapshotIRFromPath({
        absolutePathToIr: AbsoluteFilePath.of(IR_DIR),
        absolutePathToWorkspace: AbsoluteFilePath.of(AUDIENCES_DIR),
        audiences: { type: "all" },
        workspaceName: "environmentAudiencesAllHack"
    });
});

it("environments no audiences on environments but selected hack", async () => {
    const AUDIENCES_DIR = path.join(__dirname, "fixtures/audiences/fern-hack-override-environment-audience");
    await generateAndSnapshotIRFromPath({
        absolutePathToIr: AbsoluteFilePath.of(IR_DIR),
        absolutePathToWorkspace: AbsoluteFilePath.of(AUDIENCES_DIR),
        audiences: { type: "select", audiences: ["external"] },
        workspaceName: "environmentAudiencesSelectHack"
    });
});

it.skip("fhir", async () => {
    const FHIR_DIR = path.join(__dirname, "../../../../../../fern/apis/fhir");
    await generateAndSnapshotIRFromPath({
        absolutePathToIr: AbsoluteFilePath.of(IR_DIR),
        absolutePathToWorkspace: AbsoluteFilePath.of(FHIR_DIR),
        audiences: { type: "all" },
        workspaceName: "fhir"
    });
}, 200_000);

describe("test definitions", () => {
    const TEST_DEFINITIONS_DIR = path.join(__dirname, "../../../../../../../test-definitions");
    const apiNames = readdirSync(path.join(TEST_DEFINITIONS_DIR, "fern/apis"), { withFileTypes: true })
        .filter((d) => d.isDirectory())
        .map((d) => d.name);

    let workspaceMap: Map<string, AbstractAPIWorkspace<unknown>>;

    beforeAll(async () => {
        const apiWorkspaces = await loadApisOrThrow({
            fernDirectory: join(AbsoluteFilePath.of(TEST_DEFINITIONS_DIR), RelativeFilePath.of("fern")),
            context: createMockTaskContext(),
            cliVersion: "0.0.0",
            cliName: "fern",
            commandLineApiWorkspace: undefined,
            defaultToAllApiWorkspaces: true
        });
        workspaceMap = new Map(apiWorkspaces.map((w) => [w.workspaceName ?? "", w]));
    }, 200_000);

    apiNames.forEach((name) => {
        it.concurrent(name, async () => {
            const workspace = workspaceMap.get(name);
            if (!workspace) {
                throw new Error(`Workspace ${name} not found`);
            }
            await generateAndSnapshotIR({
                absolutePathToIr: AbsoluteFilePath.of(path.join(__dirname, "test-definitions")),
                workspace,
                audiences: { type: "all" },
                workspaceName: name
            });
        }, 30_000);
    });
});

describe("test definitions openapi", () => {
    const TEST_DEFINITIONS_DIR = path.join(__dirname, "../../../../../../../test-definitions-openapi");
    const apiNames = readdirSync(path.join(TEST_DEFINITIONS_DIR, "fern/apis"), { withFileTypes: true })
        .filter((d) => d.isDirectory())
        .map((d) => d.name);

    let workspaceMap: Map<string, AbstractAPIWorkspace<unknown>>;

    beforeAll(async () => {
        const apiWorkspaces = await loadApisOrThrow({
            fernDirectory: join(AbsoluteFilePath.of(TEST_DEFINITIONS_DIR), RelativeFilePath.of("fern")),
            context: createMockTaskContext(),
            cliVersion: "0.0.0",
            cliName: "fern",
            commandLineApiWorkspace: undefined,
            defaultToAllApiWorkspaces: true
        });
        workspaceMap = new Map(apiWorkspaces.map((w) => [w.workspaceName ?? "", w]));
    }, 200_000);

    apiNames.forEach((name) => {
        it.concurrent(name, async () => {
            const workspace = workspaceMap.get(name);
            if (!workspace) {
                throw new Error(`Workspace ${name} not found`);
            }
            await generateAndSnapshotIR({
                absolutePathToIr: AbsoluteFilePath.of(path.join(__dirname, "test-definitions-openapi")),
                workspace,
                audiences: name === "audiences" ? { type: "select", audiences: ["public"] } : { type: "all" },
                workspaceName: name
            });
        }, 10_000);
    });
});

it("generics", async () => {
    const GENERICS_DIR = path.join(__dirname, "fixtures/generics/fern");
    await generateAndSnapshotIRFromPath({
        absolutePathToIr: AbsoluteFilePath.of(IR_DIR),
        absolutePathToWorkspace: AbsoluteFilePath.of(GENERICS_DIR),
        audiences: { type: "all" },
        workspaceName: "generics"
    });
}, 200_000);

it("readme", async () => {
    const README_DIR = path.join(__dirname, "fixtures/readme/fern");
    await generateAndSnapshotIRFromPath({
        absolutePathToIr: AbsoluteFilePath.of(IR_DIR),
        absolutePathToWorkspace: AbsoluteFilePath.of(README_DIR),
        audiences: { type: "all" },
        workspaceName: "readme"
    });
}, 200_000);

it("availability", async () => {
    const AVAILABILITY_DIR = path.join(__dirname, "fixtures/availability/fern");
    await generateAndSnapshotIRFromPath({
        absolutePathToIr: AbsoluteFilePath.of(IR_DIR),
        absolutePathToWorkspace: AbsoluteFilePath.of(AVAILABILITY_DIR),
        audiences: { type: "all" },
        workspaceName: "availability"
    });
}, 200_000);

it("docs", async () => {
    const DOCS_DIR = path.join(__dirname, "fixtures/docs/fern");
    await generateAndSnapshotIRFromPath({
        absolutePathToIr: AbsoluteFilePath.of(IR_DIR),
        absolutePathToWorkspace: AbsoluteFilePath.of(DOCS_DIR),
        audiences: { type: "all" },
        workspaceName: "docs"
    });
}, 200_000);

describe("discriminator context inference", () => {
    const TEST_DEFINITIONS_OPENAPI_DIR = path.join(__dirname, "../../../../../../../test-definitions-openapi");
    const FIXTURE_DIR = path.join(TEST_DEFINITIONS_OPENAPI_DIR, "fern/apis/discriminator-context");

    it("infers protocol for SSE-shaped unions, data for non-SSE, and respects explicit override", async () => {
        const ir = await generateIRFromPath({
            absolutePathToWorkspace: AbsoluteFilePath.of(FIXTURE_DIR),
            workspaceName: "discriminator-context",
            audiences: { type: "all" }
        });

        const unionTypes = new Map<string, { discriminatorContext: string | undefined }>();
        for (const typeDecl of Object.values(ir.types)) {
            if (typeDecl.shape.type === "union") {
                unionTypes.set(getOriginalName(typeDecl.name.name), {
                    discriminatorContext: typeDecl.shape.discriminatorContext
                });
            }
        }

        // SSE-shaped union: all variants have only event/data/id/retry fields
        // Should infer discriminatorContext = "protocol"
        expect(unionTypes.get("SseServerEvent")).toBeDefined();
        expect(unionTypes.get("SseServerEvent")?.discriminatorContext).toBe("protocol");

        // Non-SSE union: variants have extra fields (name, breed, indoor)
        // Should default discriminatorContext = "data"
        expect(unionTypes.get("RegularUnion")).toBeDefined();
        expect(unionTypes.get("RegularUnion")?.discriminatorContext).toBe("data");

        // Explicit override: x-fern-discriminator-context = "data" even though shape matches SSE
        expect(unionTypes.get("ExplicitContextUnion")).toBeDefined();
        expect(unionTypes.get("ExplicitContextUnion")?.discriminatorContext).toBe("data");
    }, 60_000);
});
