import { AbsoluteFilePath } from "@fern-api/fs-utils";
import path from "path";
import { generateAndSnapshotIR } from "./generateAndSnapshotIR";

const IR_DIR = path.join(__dirname, "irs");

it("audiences", async () => {
    const AUDIENCES_DIR = path.join(__dirname, "fixtures/audiences/fern");
    await generateAndSnapshotIR({
        absolutePathToIr: AbsoluteFilePath.of(IR_DIR),
        absolutePathToWorkspace: AbsoluteFilePath.of(AUDIENCES_DIR),
        audiences: { type: "select", audiences: ["external"] },
        workspaceName: "audiences"
    });
});

it("fhir", async () => {
    const FHIR_DIR = path.join(__dirname, "../../../../../../fern/apis/fhir");
    await generateAndSnapshotIR({
        absolutePathToIr: AbsoluteFilePath.of(IR_DIR),
        absolutePathToWorkspace: AbsoluteFilePath.of(FHIR_DIR),
        audiences: { type: "all" },
        workspaceName: "fhir"
    });
}, 200_000);
