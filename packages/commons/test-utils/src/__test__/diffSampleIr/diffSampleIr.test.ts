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

async function expectDiff(
    fromPath: AbsoluteFilePath,
    toPath: AbsoluteFilePath,
    expectedBump: "major" | "minor" | null
) {
    const from = await createSampleIr(fromPath);
    const to = await createSampleIr(toPath);
    const changeDetector = new IntermediateRepresentationChangeDetector();
    const changes = await changeDetector.check({ from, to });
    try {
        // biome-ignore lint/suspicious/noMisplacedAssertion: test helper function
        expect(changes.bump).toBe(expectedBump);
        // biome-ignore lint/suspicious/noMisplacedAssertion: test helper function
        expect(changes.isBreaking).toBe(expectedBump === "major");
        if (expectedBump !== "major") {
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
        { testCase: [base, base, null], name: "base to base" },
        { testCase: [base, addedEndpoint, "minor"], name: "adding endpoint" },
        { testCase: [base, addedType, "minor"], name: "adding unreferencedtype" },
        { testCase: [base, addedHeader, "major"], name: "adding header" },
        { testCase: [base, addedRequiredTypeProperty, "major"], name: "adding required type property" },
        { testCase: [base, addedOptionalTypeProperty, "minor"], name: "adding optional type property" },
        { testCase: [addedEndpoint, base, "major"], name: "removing endpoint" },
        { testCase: [addedType, base, "major"], name: "removing unreferencedtype" },
        { testCase: [addedHeader, base, "major"], name: "removing header" },
        { testCase: [addedRequiredTypeProperty, base, "major"], name: "removing required type property" },
        { testCase: [addedOptionalTypeProperty, base, "major"], name: "removing optional type property" }
    ])("$name", async ({ testCase }) => {
        const [fromPath, toPath, expectedBump] = testCase as [
            AbsoluteFilePath,
            AbsoluteFilePath,
            "major" | "minor" | null
        ];
        await expectDiff(fromPath, toPath, expectedBump);
    });
});

describe("diff sample ir - unstable components", () => {
    it.each([
        { testCase: [addedUnstableEndpoint, base, "minor"], name: "removing unstable endpoint" },
        { testCase: [addedUnstableType, base, "minor"], name: "removing unstable type" },
        {
            testCase: [addedEndpoint, addedUnstableEndpoint, "major"],
            name: "migrating endpoint from stable to unstable"
        },
        { testCase: [addedType, addedUnstableType, "major"], name: "migrating type from stable to unstable" }
    ])("$name", async ({ testCase }) => {
        const [fromPath, toPath, expectedBump] = testCase as [
            AbsoluteFilePath,
            AbsoluteFilePath,
            "major" | "minor" | null
        ];
        await expectDiff(fromPath, toPath, expectedBump);
    });
});

describe("diff sample ir - unstable services to base", () => {
    it.each([
        { testCase: [unstableAddedEndpoint, base, "minor"], name: "removing endpoint from unstable service" },
        { testCase: [unstableAddedType, base, "major"], name: "removing type from unstable service" },
        { testCase: [unstableAddedHeader, base, "minor"], name: "removing header from unstable service" },
        {
            testCase: [unstableAddedOptionalTypeProperty, base, "major"],
            name: "removing optional type property from unstable service"
        },
        {
            testCase: [unstableAddedRequiredTypeProperty, base, "major"],
            name: "removing required type property from unstable service"
        }
    ])("$name", async ({ testCase }) => {
        const [fromPath, toPath, expectedBump] = testCase as [
            AbsoluteFilePath,
            AbsoluteFilePath,
            "major" | "minor" | null
        ];
        await expectDiff(fromPath, toPath, expectedBump);
    });
});

describe("diff sample ir - unstable service to anything else", () => {
    it.each([
        { testCase: [serviceUnstable, base, "minor"], name: "unstable to base" },
        { testCase: [serviceUnstable, base, "minor"], name: "unstable to base" },
        { testCase: [serviceUnstable, addedEndpoint, "minor"], name: "unstable to addedEndpoint" },
        { testCase: [serviceUnstable, addedType, "minor"], name: "unstable to addedType" },
        {
            testCase: [serviceUnstable, addedRequiredTypeProperty, "major"],
            name: "unstable to addedRequiredTypeProperty"
        },
        {
            testCase: [serviceUnstable, addedOptionalTypeProperty, "minor"],
            name: "unstable to addedOptionalTypeProperty"
        },
        {
            testCase: [serviceUnstable, addedOptionalTypeProperty, "minor"],
            name: "unstable to addedOptionalTypeProperty"
        },
        { testCase: [serviceUnstable, addedHeader, "minor"], name: "unstable to addedHeader" },
        { testCase: [serviceUnstable, addedUnstableEndpoint, "minor"], name: "unstable to addedUnstableEndpoint" },
        { testCase: [serviceUnstable, addedUnstableType, "minor"], name: "unstable to addedUnstableType" },
        { testCase: [serviceUnstable, serviceUnstable, null], name: "unstable to serviceUnstable" },
        { testCase: [serviceUnstable, unstableAddedEndpoint, "minor"], name: "unstable to unstableAddedEndpoint" },
        { testCase: [serviceUnstable, unstableAddedType, "minor"], name: "unstable to unstableAddedType" },
        { testCase: [serviceUnstable, unstableAddedHeader, "minor"], name: "unstable to unstableAddedHeader" },
        {
            testCase: [serviceUnstable, unstableAddedOptionalTypeProperty, "minor"],
            name: "unstable to unstableAddedOptionalTypeProperty"
        },
        {
            testCase: [serviceUnstable, unstableAddedRequiredTypeProperty, "major"],
            name: "unstable to unstableAddedRequiredTypeProperty"
        }
    ])("$name", async ({ testCase }) => {
        const [fromPath, toPath, expectedBump] = testCase as [
            AbsoluteFilePath,
            AbsoluteFilePath,
            "major" | "minor" | null
        ];
        await expectDiff(fromPath, toPath, expectedBump);
    });
});
