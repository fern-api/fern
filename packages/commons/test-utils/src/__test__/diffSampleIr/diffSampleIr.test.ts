import { resolve } from "node:path";

import { AbsoluteFilePath } from "@fern-api/fs-utils";
import { IntermediateRepresentationChangeDetector } from "@fern-api/ir-utils";
import { createSampleIr } from "../../createSampleIr";

describe("diff sample ir - stable versions", () => {
    const pathToBaseWorkspace = AbsoluteFilePath.of(resolve(__dirname, "stable/base"));
    const pathToAddedEndpointWorkspace = AbsoluteFilePath.of(resolve(__dirname, "stable/addedEndpoint"));
    const pathToAddedTypeWorkspace = AbsoluteFilePath.of(resolve(__dirname, "stable/addedType"));
    const pathToAddedRequiredTypePropertyWorkspace = AbsoluteFilePath.of(
        resolve(__dirname, "stable/addedRequiredTypeProperty")
    );
    const pathToAddedOptionalTypePropertyWorkspace = AbsoluteFilePath.of(
        resolve(__dirname, "stable/addedOptionalTypeProperty")
    );
    const pathToAddedHeaderWorkspace = AbsoluteFilePath.of(resolve(__dirname, "stable/addedHeader"));

    it("comparing ", async () => {
        const ir = await createSampleIr(pathToBaseWorkspace);
        const ir2 = await createSampleIr(pathToBaseWorkspace);
        const changeDetector = new IntermediateRepresentationChangeDetector();
        const changes = await changeDetector.check({ from: ir, to: ir2 });
        expect(changes.isBreaking).toBe(false);
        expect(changes.errors).toHaveLength(0);
        expect(changes.bump).toBe("minor");
    });

    it("comparing added endpoint", async () => {
        const from = await createSampleIr(pathToBaseWorkspace);
        const to = await createSampleIr(pathToAddedEndpointWorkspace);
        const changeDetector = new IntermediateRepresentationChangeDetector();
        const changes = await changeDetector.check({ from, to });
        expect(changes.isBreaking).toBe(false);
        expect(changes.errors).toHaveLength(0);
        expect(changes.bump).toBe("minor");
    });

    it("comparing added type", async () => {
        const from = await createSampleIr(pathToBaseWorkspace);
        const to = await createSampleIr(pathToAddedTypeWorkspace);
        const changeDetector = new IntermediateRepresentationChangeDetector();
        const changes = await changeDetector.check({ from, to });
        expect(changes.isBreaking).toBe(false);
        expect(changes.errors).toHaveLength(0);
        expect(changes.bump).toBe("minor");
    });

    it("comparing added header", async () => {
        const from = await createSampleIr(pathToBaseWorkspace);
        const to = await createSampleIr(pathToAddedHeaderWorkspace);
        const changeDetector = new IntermediateRepresentationChangeDetector();
        const changes = await changeDetector.check({ from, to });
        expect(changes.isBreaking).toBe(false);
        expect(changes.errors).toHaveLength(0);
        expect(changes.bump).toBe("minor");
    });

    it("comparing added required type property", async () => {
        const from = await createSampleIr(pathToBaseWorkspace);
        const to = await createSampleIr(pathToAddedRequiredTypePropertyWorkspace);
        const changeDetector = new IntermediateRepresentationChangeDetector();
        const changes = await changeDetector.check({ from, to });
        expect(changes.isBreaking).toBe(true);
        expect(changes.bump).toBe("major");
    });

    it("comparing added optional type property", async () => {
        const from = await createSampleIr(pathToBaseWorkspace);
        const to = await createSampleIr(pathToAddedOptionalTypePropertyWorkspace);
        const changeDetector = new IntermediateRepresentationChangeDetector();
        const changes = await changeDetector.check({ from, to });
        expect(changes.isBreaking).toBe(false);
        expect(changes.errors).toHaveLength(0);
        expect(changes.bump).toBe("minor");
    });

    it("comparing removed endpoint", async () => {
        const from = await createSampleIr(pathToAddedEndpointWorkspace);
        const to = await createSampleIr(pathToBaseWorkspace);
        const changeDetector = new IntermediateRepresentationChangeDetector();
        const changes = await changeDetector.check({ from, to });
        expect(changes.isBreaking).toBe(true);
        expect(changes.bump).toBe("major");
    });

    it("comparing removed type", async () => {
        const from = await createSampleIr(pathToAddedTypeWorkspace);
        const to = await createSampleIr(pathToBaseWorkspace);
        const changeDetector = new IntermediateRepresentationChangeDetector();
        const changes = await changeDetector.check({ from, to });
        expect(changes.isBreaking).toBe(true);
        expect(changes.bump).toBe("major");
    });

    it("comparing removed required type property", async () => {
        const from = await createSampleIr(pathToAddedRequiredTypePropertyWorkspace);
        const to = await createSampleIr(pathToBaseWorkspace);
        const changeDetector = new IntermediateRepresentationChangeDetector();
        const changes = await changeDetector.check({ from, to });
        expect(changes.isBreaking).toBe(true);
        expect(changes.bump).toBe("major");
    });

    it("comparing removed optional type property", async () => {
        const from = await createSampleIr(pathToAddedOptionalTypePropertyWorkspace);
        const to = await createSampleIr(pathToBaseWorkspace);
        const changeDetector = new IntermediateRepresentationChangeDetector();
        const changes = await changeDetector.check({ from, to });
        expect(changes.isBreaking).toBe(false);
        expect(changes.bump).toBe("minor");
        expect(changes.errors).toHaveLength(0);
    });

    it("comparing removed header", async () => {
        const from = await createSampleIr(pathToAddedHeaderWorkspace);
        const to = await createSampleIr(pathToBaseWorkspace);
        const changeDetector = new IntermediateRepresentationChangeDetector();
        const changes = await changeDetector.check({ from, to });
        expect(changes.isBreaking).toBe(true);
        expect(changes.bump).toBe("major");
    });
});
