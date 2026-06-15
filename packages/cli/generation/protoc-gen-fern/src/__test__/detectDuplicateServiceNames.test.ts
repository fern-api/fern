import { CodeGeneratorRequest } from "@bufbuild/protobuf/wkt";
import { describe, expect, it } from "vitest";
import { detectPackagesWithDuplicateServices } from "../generateIr.js";

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

describe("detectPackagesWithDuplicateServices", () => {
    it("returns empty set when no services have duplicate names", () => {
        const req = makeRequest([
            { package: "foo.v1", services: ["FooService"] },
            { package: "bar.v1", services: ["BarService"] }
        ]);
        const result = detectPackagesWithDuplicateServices(req);
        expect(result.size).toBe(0);
    });

    it("returns both packages when a service name appears in multiple packages", () => {
        const req = makeRequest([
            { package: "nominal.registry.v1", services: ["RegistryService"] },
            { package: "nominal.registry.v2", services: ["RegistryService"] }
        ]);
        const result = detectPackagesWithDuplicateServices(req);
        expect(result.has("nominal.registry.v1")).toBe(true);
        expect(result.has("nominal.registry.v2")).toBe(true);
        expect(result.size).toBe(2);
    });

    it("does not flag packages when same service name is in same package", () => {
        const req = makeRequest([
            { package: "foo.v1", services: ["FooService"] },
            { package: "foo.v1", services: ["FooService"] }
        ]);
        const result = detectPackagesWithDuplicateServices(req);
        // Same package, so not a cross-package collision
        expect(result.size).toBe(0);
    });

    it("returns all affected packages for multiple collisions", () => {
        const req = makeRequest([
            { package: "a.v1", services: ["ServiceA", "ServiceB"] },
            { package: "a.v2", services: ["ServiceA"] },
            { package: "b.v1", services: ["ServiceB"] }
        ]);
        const result = detectPackagesWithDuplicateServices(req);
        // a.v1 has ServiceA (collision with a.v2) and ServiceB (collision with b.v1)
        expect(result.has("a.v1")).toBe(true);
        // a.v2 has ServiceA collision
        expect(result.has("a.v2")).toBe(true);
        // b.v1 has ServiceB collision
        expect(result.has("b.v1")).toBe(true);
        expect(result.size).toBe(3);
    });

    it("returns empty set for empty request", () => {
        const req = makeRequest([]);
        const result = detectPackagesWithDuplicateServices(req);
        expect(result.size).toBe(0);
    });

    it("marks entire package even if only one of its services collides", () => {
        const req = makeRequest([
            { package: "nominal.registry.v2", services: ["RegistryService", "AnalyticsService"] },
            { package: "nominal.registry.v1", services: ["RegistryService"] }
        ]);
        const result = detectPackagesWithDuplicateServices(req);
        // Both packages are affected because RegistryService collides
        expect(result.has("nominal.registry.v1")).toBe(true);
        expect(result.has("nominal.registry.v2")).toBe(true);
        expect(result.size).toBe(2);
    });
});
