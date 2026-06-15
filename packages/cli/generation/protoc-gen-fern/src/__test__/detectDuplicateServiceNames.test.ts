import { CodeGeneratorRequest } from "@bufbuild/protobuf/wkt";
import { describe, expect, it } from "vitest";
import { detectDuplicateServiceNames } from "../generateIr.js";

function makeRequest(
    files: Array<{ package: string; services: string[] }>
): CodeGeneratorRequest {
    return {
        protoFile: files.map((f) => ({
            package: f.package,
            service: f.services.map((name) => ({ name, method: [] })),
            name: `${f.package.replace(/\./g, "/")}/service.proto`,
            dependency: [],
            publicDependency: [],
            weakDependency: [],
            messageType: [],
            enumType: [],
            extension: [],
            options: undefined,
            sourceCodeInfo: undefined,
            syntax: "proto3"
        })),
        fileToGenerate: [],
        parameter: "",
        compilerVersion: undefined,
        sourceFileDescriptors: []
    } as unknown as CodeGeneratorRequest;
}

describe("detectDuplicateServiceNames", () => {
    it("returns empty set when no services have duplicate names", () => {
        const req = makeRequest([
            { package: "foo.v1", services: ["FooService"] },
            { package: "bar.v1", services: ["BarService"] }
        ]);
        const result = detectDuplicateServiceNames(req);
        expect(result.size).toBe(0);
    });

    it("detects duplicate service names across different packages", () => {
        const req = makeRequest([
            { package: "nominal.registry.v1", services: ["RegistryService"] },
            { package: "nominal.registry.v2", services: ["RegistryService"] }
        ]);
        const result = detectDuplicateServiceNames(req);
        expect(result.has("RegistryService")).toBe(true);
        expect(result.size).toBe(1);
    });

    it("does not flag services with same name in same package", () => {
        const req = makeRequest([
            { package: "foo.v1", services: ["FooService"] },
            { package: "foo.v1", services: ["FooService"] }
        ]);
        const result = detectDuplicateServiceNames(req);
        // Same package, so not a cross-package collision
        expect(result.size).toBe(0);
    });

    it("handles multiple collisions", () => {
        const req = makeRequest([
            { package: "a.v1", services: ["ServiceA", "ServiceB"] },
            { package: "a.v2", services: ["ServiceA"] },
            { package: "b.v1", services: ["ServiceB"] }
        ]);
        const result = detectDuplicateServiceNames(req);
        expect(result.has("ServiceA")).toBe(true);
        expect(result.has("ServiceB")).toBe(true);
        expect(result.size).toBe(2);
    });

    it("returns empty set for empty request", () => {
        const req = makeRequest([]);
        const result = detectDuplicateServiceNames(req);
        expect(result.size).toBe(0);
    });
});
