import { resolve } from "node:path";

import { AbsoluteFilePath } from "@fern-api/fs-utils";
import { IntermediateRepresentationChangeDetector } from "@fern-api/ir-utils";
import { createSampleIr } from "../../createSampleIr";

const base = AbsoluteFilePath.of(resolve(__dirname, "stable/base"));
const addedEndpoint = AbsoluteFilePath.of(resolve(__dirname, "stable/addedEndpoint"));
const addedType = AbsoluteFilePath.of(resolve(__dirname, "stable/addedType"));
const addedRequiredTypeProperty = AbsoluteFilePath.of(resolve(__dirname, "stable/addedRequiredTypeProperty"));
const addedOptionalTypeProperty = AbsoluteFilePath.of(resolve(__dirname, "stable/addedOptionalTypeProperty"));
const addedHeader = AbsoluteFilePath.of(resolve(__dirname, "stable/addedHeader"));
const addedUnstableEndpoint = AbsoluteFilePath.of(resolve(__dirname, "unstable/addedUnstableEndpoint"));
const addedUnstableType = AbsoluteFilePath.of(resolve(__dirname, "unstable/addedUnstableType"));
const serviceUnstable = AbsoluteFilePath.of(resolve(__dirname, "unstable/serviceUnstableBase"));
const unstableAddedEndpoint = AbsoluteFilePath.of(resolve(__dirname, "unstable/unstableServiceAddedEndpoint"));
const unstableAddedType = AbsoluteFilePath.of(resolve(__dirname, "unstable/unstableServiceAddedType"));
const unstableAddedHeader = AbsoluteFilePath.of(resolve(__dirname, "unstable/unstableServiceAddedHeader"));
const unstableAddedOptionalTypeProperty = AbsoluteFilePath.of(
    resolve(__dirname, "unstable/unstableServiceAddedOptionalTypeProperty")
);
const unstableAddedRequiredTypeProperty = AbsoluteFilePath.of(
    resolve(__dirname, "unstable/unstableServiceAddedRequiredTypeProperty")
);

describe("diff sample ir", () => {
    it.each([
        { testCase: [base, base, false], name: "base to base" },
        { testCase: [base, addedEndpoint, false], name: "base to added endpoint" },
        { testCase: [base, addedType, false], name: "base to added type" },
        { testCase: [base, addedHeader, true], name: "base to added header" },
        { testCase: [base, addedRequiredTypeProperty, true], name: "base to added required type property" },
        { testCase: [base, addedOptionalTypeProperty, false], name: "base to added optional type property" },
        { testCase: [addedEndpoint, base, true], name: "added endpoint to base" },
        { testCase: [addedType, base, true], name: "added type to base" },
        { testCase: [addedHeader, base, true], name: "added header to base" },
        { testCase: [addedRequiredTypeProperty, base, true], name: "added required type property to base" },
        { testCase: [addedOptionalTypeProperty, base, true], name: "added optional type property to base" }
    ])("$name", async ({ testCase }) => {
        const [fromPath, toPath, isBreaking] = testCase as [AbsoluteFilePath, AbsoluteFilePath, boolean];
        const from = await createSampleIr(fromPath);
        const to = await createSampleIr(toPath);
        const changeDetector = new IntermediateRepresentationChangeDetector();
        const changes = await changeDetector.check({ from, to });
        expect(changes.isBreaking).toBe(isBreaking);
        expect(changes.bump).toBe(isBreaking ? "major" : "minor");
        if (!isBreaking) {
            expect(changes.errors).toHaveLength(0);
        }
    });
});
