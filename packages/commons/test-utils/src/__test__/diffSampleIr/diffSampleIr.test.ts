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

async function expectDiff(fromPath: AbsoluteFilePath, toPath: AbsoluteFilePath, isBreaking: boolean) {
    const from = await createSampleIr(fromPath);
    const to = await createSampleIr(toPath);
    const changeDetector = new IntermediateRepresentationChangeDetector();
    const changes = await changeDetector.check({ from, to });
    try {
        // biome-ignore lint/suspicious/noMisplacedAssertion: test helper function
        expect(changes.isBreaking).toBe(isBreaking);
        // biome-ignore lint/suspicious/noMisplacedAssertion: test helper function
        expect(changes.bump).toBe(isBreaking ? "major" : "minor");
        if (!isBreaking) {
            // biome-ignore lint/suspicious/noMisplacedAssertion: test helper function
            expect(changes.errors).toHaveLength(0);
        }
    } catch (error) {
        console.log(`changes.errors: ${JSON.stringify(changes.errors, null, 2)}`);
        throw error;
    }
}

describe("diff sample ir - stable versions", () => {
    it.each([
        { testCase: [base, base, false], name: "base to base" },
        { testCase: [base, addedEndpoint, false], name: "adding endpoint" },
        { testCase: [base, addedType, false], name: "adding type" },
        { testCase: [base, addedHeader, true], name: "adding header" },
        { testCase: [base, addedRequiredTypeProperty, true], name: "adding required type property" },
        { testCase: [base, addedOptionalTypeProperty, false], name: "adding optional type property" },
        { testCase: [addedEndpoint, base, true], name: "removing endpoint" },
        { testCase: [addedType, base, true], name: "removing type" },
        { testCase: [addedHeader, base, true], name: "removing header" },
        { testCase: [addedRequiredTypeProperty, base, true], name: "removing required type property" },
        { testCase: [addedOptionalTypeProperty, base, true], name: "removing optional type property" }
    ])("$name", async ({ testCase }) => {
        const [fromPath, toPath, isBreaking] = testCase as [AbsoluteFilePath, AbsoluteFilePath, boolean];
        await expectDiff(fromPath, toPath, isBreaking);
    });
});

describe("diff sample ir - unstable components to base", () => {
    it.each([
        { testCase: [addedUnstableEndpoint, base], name: "removing unstable endpoint" },
        { testCase: [addedUnstableType, base], name: "removing unstable type" }
    ])("$name", async ({ testCase }) => {
        const [fromPath, toPath] = testCase as [AbsoluteFilePath, AbsoluteFilePath];
        await expectDiff(fromPath, toPath, false);
    });
});

describe("diff sample ir - unstable services to base", () => {
    it.each([
        { testCase: [unstableAddedEndpoint, base], name: "removing endpoint from unstable service" },
        { testCase: [unstableAddedType, base], name: "removing type from unstable service" },
        { testCase: [unstableAddedHeader, base], name: "removing header from unstable service" },
        {
            testCase: [unstableAddedOptionalTypeProperty, base],
            name: "removing optional type property from unstable service"
        },
        {
            testCase: [unstableAddedRequiredTypeProperty, base],
            name: "removing required type property from unstable service"
        }
    ])("$name", async ({ testCase }) => {
        const [fromPath, toPath] = testCase as [AbsoluteFilePath, AbsoluteFilePath];
        await expectDiff(fromPath, toPath, false);
    });
});

describe("diff sample ir - unstable service to anything else", () => {
    it.each([
        { testCase: [serviceUnstable, base], name: "unstable to base" },
        { testCase: [serviceUnstable, base], name: "unstable to base" },
        { testCase: [serviceUnstable, addedEndpoint], name: "unstable to addedEndpoint" },
        { testCase: [serviceUnstable, addedType], name: "unstable to addedType" },
        { testCase: [serviceUnstable, addedRequiredTypeProperty], name: "unstable to addedRequiredTypeProperty" },
        { testCase: [serviceUnstable, addedOptionalTypeProperty], name: "unstable to addedOptionalTypeProperty" },
        { testCase: [serviceUnstable, addedHeader], name: "unstable to addedHeader" },
        { testCase: [serviceUnstable, addedUnstableEndpoint], name: "unstable to addedUnstableEndpoint" },
        { testCase: [serviceUnstable, addedUnstableType], name: "unstable to addedUnstableType" },
        { testCase: [serviceUnstable, serviceUnstable], name: "unstable to serviceUnstable" },
        { testCase: [serviceUnstable, unstableAddedEndpoint], name: "unstable to unstableAddedEndpoint" },
        { testCase: [serviceUnstable, unstableAddedType], name: "unstable to unstableAddedType" },
        { testCase: [serviceUnstable, unstableAddedHeader], name: "unstable to unstableAddedHeader" },
        {
            testCase: [serviceUnstable, unstableAddedOptionalTypeProperty],
            name: "unstable to unstableAddedOptionalTypeProperty"
        },
        {
            testCase: [serviceUnstable, unstableAddedRequiredTypeProperty],
            name: "unstable to unstableAddedRequiredTypeProperty"
        }
    ])("$name", async ({ testCase }) => {
        const [fromPath, toPath] = testCase as [AbsoluteFilePath, AbsoluteFilePath];
        await expectDiff(fromPath, toPath, false);
    });
});
