/* eslint-disable jest/expect-expect */
/* eslint-disable jest/valid-describe-callback */
/* eslint-disable @typescript-eslint/no-misused-promises */

import { AbsoluteFilePath } from "@fern-api/fs-utils";
import path from "path";

import { generateAndSnapshotIRFromPath } from "./generateAndSnapshotIR.js";

// Test-definitions tests are now generated as individual files by globalSetup
// for full parallel execution. See __generated__/test-definitions/ and
// __generated__/test-definitions-openapi/ directories.

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
