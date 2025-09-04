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
const serviceUnstable = AbsoluteFilePath.of(resolve(__dirname, "unstable/unstableServiceBase"));
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
        { testCase: [base, addedType, false], name: "adding unreferencedtype" },
        { testCase: [base, addedHeader, true], name: "adding header" },
        { testCase: [base, addedRequiredTypeProperty, true], name: "adding required type property" },
        { testCase: [base, addedOptionalTypeProperty, false], name: "adding optional type property" },
        { testCase: [addedEndpoint, base, true], name: "removing endpoint" },
        { testCase: [addedType, base, true], name: "removing unreferencedtype" },
        { testCase: [addedHeader, base, true], name: "removing header" },
        { testCase: [addedRequiredTypeProperty, base, true], name: "removing required type property" },
        { testCase: [addedOptionalTypeProperty, base, true], name: "removing optional type property" }
    ])("$name", async ({ testCase }) => {
        const [fromPath, toPath, isBreaking] = testCase as [AbsoluteFilePath, AbsoluteFilePath, boolean];
        await expectDiff(fromPath, toPath, isBreaking);
    });
});

describe("diff sample ir - unstable components", () => {
    it.each([
        { testCase: [addedUnstableEndpoint, base, false], name: "removing unstable endpoint" },
        { testCase: [addedUnstableType, base, false], name: "removing unstable type" },
        { testCase: [addedEndpoint, addedUnstableEndpoint, true], name: "migrating endpoint from stable to unstable" },
        { testCase: [addedType, addedUnstableType, true], name: "migrating type from stable to unstable" }
    ])("$name", async ({ testCase }) => {
        const [fromPath, toPath, isBreaking] = testCase as [AbsoluteFilePath, AbsoluteFilePath, boolean];
        await expectDiff(fromPath, toPath, isBreaking);
    });
});

describe("diff sample ir - unstable services to base", () => {
    it.each([
        { testCase: [unstableAddedEndpoint, base, false], name: "removing endpoint from unstable service" },
        { testCase: [unstableAddedType, base, true], name: "removing type from unstable service" },
        { testCase: [unstableAddedHeader, base, false], name: "removing header from unstable service" },
        {
            testCase: [unstableAddedOptionalTypeProperty, base, true],
            name: "removing optional type property from unstable service"
        },
        {
            testCase: [unstableAddedRequiredTypeProperty, base, true],
            name: "removing required type property from unstable service"
        }
    ])("$name", async ({ testCase }) => {
        const [fromPath, toPath, isBreaking] = testCase as [AbsoluteFilePath, AbsoluteFilePath, boolean];
        await expectDiff(fromPath, toPath, isBreaking);
    });
});

describe("diff sample ir - unstable service to anything else", () => {
    it.each([
        { testCase: [serviceUnstable, base, false], name: "unstable to base" },
        { testCase: [serviceUnstable, base, false], name: "unstable to base" },
        { testCase: [serviceUnstable, addedEndpoint, false], name: "unstable to addedEndpoint" },
        { testCase: [serviceUnstable, addedType, false], name: "unstable to addedType" },
        { testCase: [serviceUnstable, addedRequiredTypeProperty, true], name: "unstable to addedRequiredTypeProperty" },
        {
            testCase: [serviceUnstable, addedOptionalTypeProperty, false],
            name: "unstable to addedOptionalTypeProperty"
        },
        {
            testCase: [serviceUnstable, addedOptionalTypeProperty, false],
            name: "unstable to addedOptionalTypeProperty"
        },
        { testCase: [serviceUnstable, addedHeader, false], name: "unstable to addedHeader" },
        { testCase: [serviceUnstable, addedUnstableEndpoint, false], name: "unstable to addedUnstableEndpoint" },
        { testCase: [serviceUnstable, addedUnstableType, false], name: "unstable to addedUnstableType" },
        { testCase: [serviceUnstable, serviceUnstable, false], name: "unstable to serviceUnstable" },
        { testCase: [serviceUnstable, unstableAddedEndpoint, false], name: "unstable to unstableAddedEndpoint" },
        { testCase: [serviceUnstable, unstableAddedType, false], name: "unstable to unstableAddedType" },
        { testCase: [serviceUnstable, unstableAddedHeader, false], name: "unstable to unstableAddedHeader" },
        {
            testCase: [serviceUnstable, unstableAddedOptionalTypeProperty, false],
            name: "unstable to unstableAddedOptionalTypeProperty"
        },
        {
            testCase: [serviceUnstable, unstableAddedRequiredTypeProperty, true],
            name: "unstable to unstableAddedRequiredTypeProperty"
        }
    ])("$name", async ({ testCase }) => {
        const [fromPath, toPath, isBreaking] = testCase as [AbsoluteFilePath, AbsoluteFilePath, boolean];
        await expectDiff(fromPath, toPath, isBreaking);
    });
});
