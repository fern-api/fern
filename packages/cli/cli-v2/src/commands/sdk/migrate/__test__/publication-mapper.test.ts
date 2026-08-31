import { AbsoluteFilePath } from "@fern-api/fs-utils";
import { join } from "path";
import { describe, expect, it } from "vitest";
import { createTestContextWithCapture } from "../../../../__test__/utils/createTestContext.js";
import type { Target } from "../../../../sdk/config/Target.js";
import { PublicationMapper } from "../mapper/PublicationMapper.js";

const SIMPLE_API_DIR = AbsoluteFilePath.of(join(__dirname, "../../../../__test__/fixtures/simple-api"));

type MappingTestCase = {
    expectedPackage: NonNullable<PublicationMapper.Result["package"]>;
    expectedRegistry: NonNullable<PublicationMapper.Result["publish"]>["registry"];
    language: Target["lang"];
    publish: NonNullable<Target["publish"]>;
};

const MAPPINGS: MappingTestCase[] = [
    {
        language: "typescript",
        publish: { npm: { packageName: "@acme/sdk" } },
        expectedPackage: { packageName: "@acme/sdk" },
        expectedRegistry: "npm"
    },
    {
        language: "python",
        publish: { pypi: { packageName: "acme-sdk" } },
        expectedPackage: { packageName: "acme-sdk" },
        expectedRegistry: "pypi"
    },
    {
        language: "java",
        publish: { maven: { coordinate: " com.acme : sdk " } },
        expectedPackage: { groupId: "com.acme", artifactId: "sdk" },
        expectedRegistry: "maven"
    },
    {
        language: "csharp",
        publish: { nuget: { packageName: "Acme.Sdk" } },
        expectedPackage: { packageName: "Acme.Sdk" },
        expectedRegistry: "nuget"
    },
    {
        language: "ruby",
        publish: { rubygems: { packageName: "acme-sdk" } },
        expectedPackage: { packageName: "acme-sdk" },
        expectedRegistry: "rubygems"
    },
    {
        language: "rust",
        publish: { crates: { packageName: "acme-sdk" } },
        expectedPackage: { packageName: "acme-sdk" },
        expectedRegistry: "crates"
    }
];

describe("PublicationMapper", () => {
    it.each(MAPPINGS)("maps $language publication to $expectedRegistry", async (testCase) => {
        const { context } = await createTestContextWithCapture({ cwd: SIMPLE_API_DIR });
        const workspace = await context.loadWorkspaceOrThrow();
        const target = workspace.sdks?.targets[0];
        if (target == null) {
            throw new Error("Expected an SDK target in test workspace");
        }

        const result = new PublicationMapper().map({
            index: 0,
            target: { ...target, lang: testCase.language, publish: testCase.publish }
        });

        expect(result).toMatchObject({
            diagnostics: [],
            package: testCase.expectedPackage,
            publish: { registry: testCase.expectedRegistry }
        });
    });

    it("preserves the language path for mismatched publication diagnostics", async () => {
        const { context } = await createTestContextWithCapture({ cwd: SIMPLE_API_DIR });
        const workspace = await context.loadWorkspaceOrThrow();
        const target = workspace.sdks?.targets[0];
        if (target == null) {
            throw new Error("Expected an SDK target in test workspace");
        }

        const result = new PublicationMapper().map({
            index: 0,
            target: { ...target, lang: "typescript", publish: { pypi: { packageName: "acme-sdk" } } }
        });

        expect(result.diagnostics).toEqual([
            expect.objectContaining({ path: ["group", "generators", 0, "publish", "typescript"] })
        ]);
    });

    it("uses discrete path segments for invalid Maven coordinates", async () => {
        const { context } = await createTestContextWithCapture({ cwd: SIMPLE_API_DIR });
        const workspace = await context.loadWorkspaceOrThrow();
        const target = workspace.sdks?.targets[0];
        if (target == null) {
            throw new Error("Expected an SDK target in test workspace");
        }

        const result = new PublicationMapper().map({
            index: 0,
            target: { ...target, lang: "java", publish: { maven: { coordinate: ":artifact" } } }
        });

        expect(result.diagnostics).toEqual([
            expect.objectContaining({ path: ["group", "generators", 0, "publish", "maven", "coordinate"] })
        ]);
    });
});
