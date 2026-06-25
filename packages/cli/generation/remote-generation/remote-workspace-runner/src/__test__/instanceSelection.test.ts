import { describe, expect, it } from "vitest";

// Replicate the instance selection logic locally to avoid heavy transitive imports.
// This must stay in sync with runRemoteGenerationForDocsWorkspace.ts (lines 82-113).

interface DocsInstance {
    url: string;
    customDomain?: string | string[];
}

interface InstanceSelectionResult {
    instance?: DocsInstance;
    error?: string;
}

/**
 * Pure extraction of the instance resolution logic from runRemoteGenerationForDocsWorkspace.
 * Given the configured instances and an optional --instance URL flag, returns either
 * the selected instance or the error message that would be passed to context.failAndThrow.
 */
function resolveDocsInstance(instances: DocsInstance[], instanceUrl: string | undefined): InstanceSelectionResult {
    if (instances.length === 0) {
        return { error: "No instances specified in docs.yml! Cannot register docs." };
    }

    if (instances.length > 1 && instanceUrl == null) {
        return {
            error: `More than one docs instances. Please specify one (e.g. --instance ${instances[0]?.url})`
        };
    }

    const maybeInstance =
        instanceUrl != null ? instances.find((instance) => instance.url === instanceUrl) : instances[0];

    if (maybeInstance == null) {
        const available = instances.map((inst) => `  - ${inst.url}`).join("\n");
        return {
            error:
                instanceUrl != null
                    ? `No docs instance found matching '${instanceUrl}'.\n\nAvailable instances:\n${available}`
                    : `No docs instance found. Failed to register.`
        };
    }

    return { instance: maybeInstance };
}

describe("docs instance selection logic", () => {
    const INSTANCE_A: DocsInstance = { url: "instance-a.docs.buildwithfern.com" };
    const INSTANCE_B: DocsInstance = { url: "instance-b.docs.buildwithfern.com" };
    const INSTANCE_C: DocsInstance = { url: "instance-c.docs.buildwithfern.com" };

    describe("zero instances configured", () => {
        it("should error when no instances are specified in docs.yml", () => {
            const result = resolveDocsInstance([], undefined);
            expect(result.error).toBe("No instances specified in docs.yml! Cannot register docs.");
            expect(result.instance).toBeUndefined();
        });

        it("should error even when --instance flag is provided but no instances configured", () => {
            const result = resolveDocsInstance([], "some.docs.buildwithfern.com");
            expect(result.error).toBe("No instances specified in docs.yml! Cannot register docs.");
            expect(result.instance).toBeUndefined();
        });
    });

    describe("single instance configured", () => {
        it("should select the only instance when no --instance flag is provided", () => {
            const result = resolveDocsInstance([INSTANCE_A], undefined);
            expect(result.instance).toBe(INSTANCE_A);
            expect(result.error).toBeUndefined();
        });

        it("should select the instance when --instance flag matches", () => {
            const result = resolveDocsInstance([INSTANCE_A], "instance-a.docs.buildwithfern.com");
            expect(result.instance).toBe(INSTANCE_A);
            expect(result.error).toBeUndefined();
        });

        it("should error when --instance flag does not match the configured instance", () => {
            const result = resolveDocsInstance([INSTANCE_A], "nonexistent.docs.buildwithfern.com");
            expect(result.error).toContain("No docs instance found matching 'nonexistent.docs.buildwithfern.com'");
            expect(result.error).toContain("instance-a.docs.buildwithfern.com");
            expect(result.instance).toBeUndefined();
        });
    });

    describe("multiple instances configured", () => {
        const allInstances = [INSTANCE_A, INSTANCE_B, INSTANCE_C];

        it("should error when no --instance flag is provided", () => {
            const result = resolveDocsInstance(allInstances, undefined);
            expect(result.error).toContain("More than one docs instances");
            expect(result.error).toContain("--instance");
            expect(result.error).toContain(INSTANCE_A.url);
            expect(result.instance).toBeUndefined();
        });

        it("should select the correct instance when --instance matches the first", () => {
            const result = resolveDocsInstance(allInstances, "instance-a.docs.buildwithfern.com");
            expect(result.instance).toBe(INSTANCE_A);
            expect(result.error).toBeUndefined();
        });

        it("should select the correct instance when --instance matches a non-first instance", () => {
            const result = resolveDocsInstance(allInstances, "instance-b.docs.buildwithfern.com");
            expect(result.instance).toBe(INSTANCE_B);
            expect(result.error).toBeUndefined();
        });

        it("should not fall back to the first instance when --instance does not match (the bug fix)", () => {
            const result = resolveDocsInstance(allInstances, "nonexistent.docs.buildwithfern.com");
            expect(result.instance).toBeUndefined();
            expect(result.error).toContain("No docs instance found matching 'nonexistent.docs.buildwithfern.com'");
        });

        it("should list all available instances in the error message when --instance does not match", () => {
            const result = resolveDocsInstance(allInstances, "nonexistent.docs.buildwithfern.com");
            expect(result.error).toContain("Available instances:");
            expect(result.error).toContain("  - instance-a.docs.buildwithfern.com");
            expect(result.error).toContain("  - instance-b.docs.buildwithfern.com");
            expect(result.error).toContain("  - instance-c.docs.buildwithfern.com");
        });

        it("should require exact URL match (no partial matching)", () => {
            const result = resolveDocsInstance(allInstances, "instance-b");
            expect(result.instance).toBeUndefined();
            expect(result.error).toContain("No docs instance found matching 'instance-b'");
        });
    });
});
