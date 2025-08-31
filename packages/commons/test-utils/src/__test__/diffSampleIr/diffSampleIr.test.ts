import { resolve } from "node:path";

import { AbsoluteFilePath } from "@fern-api/fs-utils";
import { IntermediateRepresentationChangeDetector } from "@fern-api/ir-utils";
import { createSampleIr } from "../../createSampleIr";

describe("diff sample ir - stable versions", () => {
    const pathToBaseWorkspace = AbsoluteFilePath.of(resolve(__dirname, "stable/base"));
    const pathToAddedEndpointWorkspace = AbsoluteFilePath.of(resolve(__dirname, "stable/addedEndpoint"));
    const pathToAddedTypeWorkspace = AbsoluteFilePath.of(resolve(__dirname, "stable/addedType"));
    const pathToAddedTypePropertyWorkspace = AbsoluteFilePath.of(resolve(__dirname, "stable/addedTypeProperty"));
    const pathToAddedHeaderWorkspace = AbsoluteFilePath.of(resolve(__dirname, "stable/addedHeader"));
    const pathToRemovedEndpointWorkspace = AbsoluteFilePath.of(resolve(__dirname, "stable/removedEndpoint"));
    const pathToRemovedTypeWorkspace = AbsoluteFilePath.of(resolve(__dirname, "stable/removedType"));
    const pathToRemovedTypePropertyWorkspace = AbsoluteFilePath.of(resolve(__dirname, "stable/removedTypeProperty"));
    const pathToRemovedHeaderWorkspace = AbsoluteFilePath.of(resolve(__dirname, "stable/removedHeader"));

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
        const baseIr = await createSampleIr(pathToBaseWorkspace);
        const changedIr = await createSampleIr(pathToAddedEndpointWorkspace);
        const changeDetector = new IntermediateRepresentationChangeDetector();
        const changes = await changeDetector.check({ from: baseIr, to: changedIr });
        console.log(JSON.stringify(changes, null, 2));
        expect(changes.isBreaking).toBe(false);
        expect(changes.errors).toHaveLength(0);
        expect(changes.bump).toBe("minor");
    });

    it.skip("comparing added type", async () => {
        const baseIr = await createSampleIr(pathToBaseWorkspace);
        const changedIr = await createSampleIr(pathToAddedTypeWorkspace);
        const changeDetector = new IntermediateRepresentationChangeDetector();
        const changes = await changeDetector.check({ from: baseIr, to: changedIr });
        expect(changes.isBreaking).toBe(false);
        expect(changes.errors).toHaveLength(0);
        expect(changes.bump).toBe("minor");
    });

    it.skip("comparing added header", async () => {
        const baseIr = await createSampleIr(pathToBaseWorkspace);
        const changedIr = await createSampleIr(pathToAddedHeaderWorkspace);
        const changeDetector = new IntermediateRepresentationChangeDetector();
        const changes = await changeDetector.check({ from: baseIr, to: changedIr });
        expect(changes.isBreaking).toBe(false);
        expect(changes.errors).toHaveLength(0);
        expect(changes.bump).toBe("minor");
    });

    it.skip("comparing added type property", async () => {
        const baseIr = await createSampleIr(pathToBaseWorkspace);
        const changedIr = await createSampleIr(pathToAddedTypePropertyWorkspace);
        const changeDetector = new IntermediateRepresentationChangeDetector();
        const changes = await changeDetector.check({ from: baseIr, to: changedIr });
        expect(changes.isBreaking).toBe(false);
        expect(changes.errors).toHaveLength(0);
        expect(changes.bump).toBe("minor");
    });

    it.skip("comparing removed endpoint", async () => {
        const baseIr = await createSampleIr(pathToBaseWorkspace);
        const changedIr = await createSampleIr(pathToRemovedEndpointWorkspace);
        const changeDetector = new IntermediateRepresentationChangeDetector();
        const changes = await changeDetector.check({ from: baseIr, to: changedIr });
        expect(changes.isBreaking).toBe(true);
        expect(changes.bump).toBe("major");
    });

    it.skip("comparing removed type", async () => {
        const baseIr = await createSampleIr(pathToBaseWorkspace);
        const changedIr = await createSampleIr(pathToRemovedTypeWorkspace);
        const changeDetector = new IntermediateRepresentationChangeDetector();
        const changes = await changeDetector.check({ from: baseIr, to: changedIr });
        expect(changes.isBreaking).toBe(true);
        expect(changes.bump).toBe("major");
    });

    it.skip("comparing removed type property", async () => {
        const baseIr = await createSampleIr(pathToBaseWorkspace);
        const changedIr = await createSampleIr(pathToRemovedTypePropertyWorkspace);
        const changeDetector = new IntermediateRepresentationChangeDetector();
        const changes = await changeDetector.check({ from: baseIr, to: changedIr });
        expect(changes.isBreaking).toBe(true);
        expect(changes.bump).toBe("major");
    });

    it.skip("comparing removed type property", async () => {
        const baseIr = await createSampleIr(pathToBaseWorkspace);
        const changedIr = await createSampleIr(pathToRemovedTypePropertyWorkspace);
        const changeDetector = new IntermediateRepresentationChangeDetector();
        const changes = await changeDetector.check({ from: baseIr, to: changedIr });
        expect(changes.isBreaking).toBe(true);
        expect(changes.bump).toBe("major");
    });

    it.skip("comparing removed header", async () => {
        const baseIr = await createSampleIr(pathToBaseWorkspace);
        const changedIr = await createSampleIr(pathToRemovedHeaderWorkspace);
        const changeDetector = new IntermediateRepresentationChangeDetector();
        const changes = await changeDetector.check({ from: baseIr, to: changedIr });
        expect(changes.isBreaking).toBe(true);
        expect(changes.bump).toBe("major");
    });
});
