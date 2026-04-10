import { createMockTaskContext } from "@fern-api/task-context";

import { GeneratorName } from "../GeneratorName.js";
import {
    addDefaultDockerOrgIfNotPresent,
    correctIncorrectDockerOrg,
    correctIncorrectDockerOrgWithWarning,
    DEFAULT_DOCKER_ORG,
    getGeneratorNameOrThrow,
    INCORRECT_DOCKER_ORG,
    normalizeGeneratorName,
    removeDefaultDockerOrgIfPresent
} from "../getGeneratorName.js";

describe("addDefaultDockerOrgIfNotPresent", () => {
    it("adds fernapi/ prefix to shorthand names", () => {
        expect(addDefaultDockerOrgIfNotPresent("fern-typescript-sdk")).toBe("fernapi/fern-typescript-sdk");
    });

    it("adds fernapi/ prefix to other shorthand names", () => {
        expect(addDefaultDockerOrgIfNotPresent("fern-python-sdk")).toBe("fernapi/fern-python-sdk");
        expect(addDefaultDockerOrgIfNotPresent("fern-java-sdk")).toBe("fernapi/fern-java-sdk");
        expect(addDefaultDockerOrgIfNotPresent("fern-go-sdk")).toBe("fernapi/fern-go-sdk");
        expect(addDefaultDockerOrgIfNotPresent("fern-csharp-sdk")).toBe("fernapi/fern-csharp-sdk");
    });

    it("preserves fernapi/ prefix if already present", () => {
        expect(addDefaultDockerOrgIfNotPresent("fernapi/fern-typescript-sdk")).toBe("fernapi/fern-typescript-sdk");
    });

    it("corrects deprecated fern-api/ prefix to fernapi/", () => {
        expect(addDefaultDockerOrgIfNotPresent("fern-api/fern-typescript-sdk")).toBe("fernapi/fern-typescript-sdk");
        expect(addDefaultDockerOrgIfNotPresent("fern-api/fern-python-sdk")).toBe("fernapi/fern-python-sdk");
    });

    it("preserves custom org prefixes", () => {
        expect(addDefaultDockerOrgIfNotPresent("myorg/my-generator")).toBe("myorg/my-generator");
        expect(addDefaultDockerOrgIfNotPresent("customorg/fern-typescript-sdk")).toBe("customorg/fern-typescript-sdk");
    });

    it("handles names with multiple slashes (keeps as-is)", () => {
        // Docker images with multiple slashes are technically valid (e.g., registry.example.com/org/image)
        expect(addDefaultDockerOrgIfNotPresent("registry.io/myorg/generator")).toBe("registry.io/myorg/generator");
    });

    it("handles empty string", () => {
        expect(addDefaultDockerOrgIfNotPresent("")).toBe("fernapi/");
    });
});

describe("removeDefaultDockerOrgIfPresent", () => {
    it("removes fernapi/ prefix from generator names", () => {
        expect(removeDefaultDockerOrgIfPresent("fernapi/fern-typescript-sdk")).toBe("fern-typescript-sdk");
    });

    it("removes fernapi/ prefix from other generator names", () => {
        expect(removeDefaultDockerOrgIfPresent("fernapi/fern-python-sdk")).toBe("fern-python-sdk");
        expect(removeDefaultDockerOrgIfPresent("fernapi/fern-java-sdk")).toBe("fern-java-sdk");
    });

    it("preserves shorthand names without prefix", () => {
        expect(removeDefaultDockerOrgIfPresent("fern-typescript-sdk")).toBe("fern-typescript-sdk");
    });

    it("preserves custom org prefixes", () => {
        expect(removeDefaultDockerOrgIfPresent("myorg/my-generator")).toBe("myorg/my-generator");
        expect(removeDefaultDockerOrgIfPresent("customorg/fern-typescript-sdk")).toBe("customorg/fern-typescript-sdk");
    });

    it("handles names without slashes", () => {
        expect(removeDefaultDockerOrgIfPresent("generator-name")).toBe("generator-name");
    });

    it("handles empty string", () => {
        expect(removeDefaultDockerOrgIfPresent("")).toBe("");
    });

    it("is case-sensitive for org prefix", () => {
        expect(removeDefaultDockerOrgIfPresent("FernApi/fern-typescript-sdk")).toBe("FernApi/fern-typescript-sdk");
        expect(removeDefaultDockerOrgIfPresent("FERNAPI/fern-typescript-sdk")).toBe("FERNAPI/fern-typescript-sdk");
    });
});

describe("roundtrip operations", () => {
    it("add then remove returns to shorthand", () => {
        const shorthand = "fern-typescript-sdk";
        const withOrg = addDefaultDockerOrgIfNotPresent(shorthand);
        const backToShorthand = removeDefaultDockerOrgIfPresent(withOrg);
        expect(backToShorthand).toBe(shorthand);
    });

    it("remove then add returns to full name", () => {
        const fullName = "fernapi/fern-typescript-sdk";
        const shorthand = removeDefaultDockerOrgIfPresent(fullName);
        const backToFull = addDefaultDockerOrgIfNotPresent(shorthand);
        expect(backToFull).toBe(fullName);
    });

    it("preserves custom org through both operations", () => {
        const customOrg = "myorg/my-generator";
        const afterAdd = addDefaultDockerOrgIfNotPresent(customOrg);
        expect(afterAdd).toBe(customOrg); // Should not change
        const afterRemove = removeDefaultDockerOrgIfPresent(afterAdd);
        expect(afterRemove).toBe(customOrg); // Should still not change
    });
});

describe("normalizeGeneratorName", () => {
    it("normalizes shorthand names to valid GeneratorName", () => {
        const result = normalizeGeneratorName("fern-typescript-sdk");
        expect(result).toBe(GeneratorName.TYPESCRIPT_SDK);
    });

    it("normalizes full names to valid GeneratorName", () => {
        const result = normalizeGeneratorName("fernapi/fern-typescript-sdk");
        expect(result).toBe(GeneratorName.TYPESCRIPT_SDK);
    });

    it("returns undefined for unrecognized generators", () => {
        const result = normalizeGeneratorName("unknown-generator");
        expect(result).toBeUndefined();
    });

    it("returns undefined for custom org generators", () => {
        const result = normalizeGeneratorName("myorg/my-generator");
        expect(result).toBeUndefined();
    });

    it("handles various official generators", () => {
        expect(normalizeGeneratorName("fern-python-sdk")).toBe(GeneratorName.PYTHON_SDK);
        expect(normalizeGeneratorName("fernapi/fern-python-sdk")).toBe(GeneratorName.PYTHON_SDK);
        expect(normalizeGeneratorName("fern-java-sdk")).toBe(GeneratorName.JAVA_SDK);
        expect(normalizeGeneratorName("fernapi/fern-java-sdk")).toBe(GeneratorName.JAVA_SDK);
    });

    it("resolves legacy alias java-model to fern-java-model", () => {
        expect(normalizeGeneratorName("java-model")).toBe(GeneratorName.JAVA_MODEL);
        expect(normalizeGeneratorName("fernapi/java-model")).toBe(GeneratorName.JAVA_MODEL);
    });
});

describe("getGeneratorNameOrThrow", () => {
    it("returns GeneratorName for valid shorthand names", () => {
        const context = createMockTaskContext();
        const result = getGeneratorNameOrThrow("fern-typescript-sdk", context);
        expect(result).toBe(GeneratorName.TYPESCRIPT_SDK);
    });

    it("returns GeneratorName for valid full names", () => {
        const context = createMockTaskContext();
        const result = getGeneratorNameOrThrow("fernapi/fern-python-sdk", context);
        expect(result).toBe(GeneratorName.PYTHON_SDK);
    });

    it("throws for unrecognized generator names", () => {
        const context = createMockTaskContext();
        expect(() => getGeneratorNameOrThrow("unknown-generator", context)).toThrow();
    });

    it("throws for custom org generators", () => {
        const context = createMockTaskContext();
        expect(() => getGeneratorNameOrThrow("myorg/my-generator", context)).toThrow();
    });
});

describe("DEFAULT_DOCKER_ORG constant", () => {
    it("is set to 'fernapi'", () => {
        expect(DEFAULT_DOCKER_ORG).toBe("fernapi");
    });
});

describe("edge cases and compatibility", () => {
    it("handles generator names with hyphens", () => {
        const name = "fern-typescript-node-sdk";
        expect(addDefaultDockerOrgIfNotPresent(name)).toBe(`${DEFAULT_DOCKER_ORG}/${name}`);
    });

    it("handles idempotent add operations", () => {
        const name = "fern-typescript-sdk";
        const once = addDefaultDockerOrgIfNotPresent(name);
        const twice = addDefaultDockerOrgIfNotPresent(once);
        expect(once).toBe(twice);
    });

    it("handles idempotent remove operations", () => {
        const name = "fern-typescript-sdk";
        const once = removeDefaultDockerOrgIfPresent(name);
        const twice = removeDefaultDockerOrgIfPresent(once);
        expect(once).toBe(twice);
    });

    it("normalization is consistent with both input formats", () => {
        const shorthand = "fern-typescript-sdk";
        const fullName = "fernapi/fern-typescript-sdk";
        expect(normalizeGeneratorName(shorthand)).toBe(normalizeGeneratorName(fullName));
    });
});

describe("real-world scenarios", () => {
    it("handles duplicate detection scenario", () => {
        // Simulates the duplicate detection in addGenerator
        const existingGenerators = ["fern-typescript-sdk", "fernapi/fern-python-sdk", "myorg/custom"];
        const newGenerator = "fernapi/fern-typescript-sdk";

        const normalizedNew = addDefaultDockerOrgIfNotPresent(newGenerator);
        const isDuplicate = existingGenerators.some((gen) => addDefaultDockerOrgIfNotPresent(gen) === normalizedNew);

        expect(isDuplicate).toBe(true);
    });

    it("handles upgrade filter matching scenario", () => {
        // Simulates the filter matching in upgradeGenerator
        const yamlGeneratorName = "fern-csharp-sdk";
        const cliFilterArg = "fern-csharp-sdk";

        const normalizedYaml = addDefaultDockerOrgIfNotPresent(yamlGeneratorName);
        const normalizedFilter = addDefaultDockerOrgIfNotPresent(cliFilterArg);

        expect(normalizedYaml).toBe(normalizedFilter);
    });

    it("handles mixed format upgrade filter matching", () => {
        // YAML has shorthand, CLI uses full name
        const yamlGeneratorName = "fern-csharp-sdk";
        const cliFilterArg = "fernapi/fern-csharp-sdk";

        const normalizedYaml = addDefaultDockerOrgIfNotPresent(yamlGeneratorName);
        const normalizedFilter = addDefaultDockerOrgIfNotPresent(cliFilterArg);

        expect(normalizedYaml).toBe(normalizedFilter);
    });

    it("handles config writing scenario", () => {
        // When adding a generator, we normalize for lookups but write shorthand
        const userInput = "fern-typescript-sdk";
        const normalized = addDefaultDockerOrgIfNotPresent(userInput);
        const toWrite = removeDefaultDockerOrgIfPresent(normalized);

        expect(toWrite).toBe(userInput);
    });

    it("handles FDR API call scenario", () => {
        // When calling FDR API, we need full name even if YAML has shorthand
        const yamlName = "fern-csharp-sdk";
        const fdrApiName = addDefaultDockerOrgIfNotPresent(yamlName);

        expect(fdrApiName).toBe("fernapi/fern-csharp-sdk");
        expect(fdrApiName).toContain("/");
    });

    it("handles deprecated fern-api/ org in generators.yml", () => {
        // User accidentally uses fern-api/ (GitHub org) instead of fernapi/ (Docker org)
        const yamlName = "fern-api/fern-typescript-sdk";
        const normalized = addDefaultDockerOrgIfNotPresent(yamlName);
        expect(normalized).toBe("fernapi/fern-typescript-sdk");
    });

    it("handles deprecated fern-api/ org in CLI --generator filter", () => {
        // User passes fern-api/fern-typescript-sdk on CLI
        const cliArg = "fern-api/fern-typescript-sdk";
        const normalized = addDefaultDockerOrgIfNotPresent(cliArg);
        const yamlNormalized = addDefaultDockerOrgIfNotPresent("fern-typescript-sdk");
        expect(normalized).toBe(yamlNormalized);
    });
});

describe("correctIncorrectDockerOrg", () => {
    it("corrects fern-api/ to fernapi/", () => {
        expect(correctIncorrectDockerOrg("fern-api/fern-typescript-sdk")).toBe("fernapi/fern-typescript-sdk");
        expect(correctIncorrectDockerOrg("fern-api/fern-python-sdk")).toBe("fernapi/fern-python-sdk");
        expect(correctIncorrectDockerOrg("fern-api/fern-java-sdk")).toBe("fernapi/fern-java-sdk");
    });

    it("does not modify fernapi/ names", () => {
        expect(correctIncorrectDockerOrg("fernapi/fern-typescript-sdk")).toBe("fernapi/fern-typescript-sdk");
    });

    it("does not modify shorthand names", () => {
        expect(correctIncorrectDockerOrg("fern-typescript-sdk")).toBe("fern-typescript-sdk");
    });

    it("does not modify custom org names", () => {
        expect(correctIncorrectDockerOrg("myorg/my-generator")).toBe("myorg/my-generator");
    });

    it("handles empty string", () => {
        expect(correctIncorrectDockerOrg("")).toBe("");
    });
});

describe("correctIncorrectDockerOrgWithWarning", () => {
    it("corrects fern-api/ to fernapi/ and logs warning", () => {
        const context = createMockTaskContext();
        const result = correctIncorrectDockerOrgWithWarning("fern-api/fern-typescript-sdk", context);
        expect(result).toBe("fernapi/fern-typescript-sdk");
    });

    it("does not log warning for correct names", () => {
        const context = createMockTaskContext();
        const result = correctIncorrectDockerOrgWithWarning("fernapi/fern-typescript-sdk", context);
        expect(result).toBe("fernapi/fern-typescript-sdk");
    });

    it("does not log warning for shorthand names", () => {
        const context = createMockTaskContext();
        const result = correctIncorrectDockerOrgWithWarning("fern-typescript-sdk", context);
        expect(result).toBe("fern-typescript-sdk");
    });
});

describe("INCORRECT_DOCKER_ORG constant", () => {
    it("is set to 'fern-api'", () => {
        expect(INCORRECT_DOCKER_ORG).toBe("fern-api");
    });
});

describe("normalizeGeneratorName with deprecated org", () => {
    it("normalizes fern-api/ prefixed names to valid GeneratorName", () => {
        expect(normalizeGeneratorName("fern-api/fern-typescript-sdk")).toBe(GeneratorName.TYPESCRIPT_SDK);
        expect(normalizeGeneratorName("fern-api/fern-python-sdk")).toBe(GeneratorName.PYTHON_SDK);
        expect(normalizeGeneratorName("fern-api/fern-java-sdk")).toBe(GeneratorName.JAVA_SDK);
    });
});
