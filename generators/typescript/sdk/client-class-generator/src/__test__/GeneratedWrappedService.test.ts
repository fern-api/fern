import { FernIr } from "@fern-fern/ir-sdk";
import { caseConverter, casingsGenerator } from "@fern-typescript/test-utils";
import { ClassDeclarationStructure, Scope, StructureKind, ts } from "ts-morph";
import { describe, expect, it } from "vitest";

import { GeneratedWrappedService } from "../GeneratedWrappedService.js";

// ── Helpers ────────────────────────────────────────────────────────────

function createFernFilepath(parts: string[]): FernIr.FernFilepath {
    return {
        allParts: parts.map((p) => casingsGenerator.generateName(p)),
        packagePath: parts.slice(0, -1).map((p) => casingsGenerator.generateName(p)),
        // biome-ignore lint/style/noNonNullAssertion: Safe - value asserted above
        file: parts.length > 0 ? casingsGenerator.generateName(parts[parts.length - 1]!) : undefined
    };
}

function createSubpackage(name: string): FernIr.Subpackage {
    return {
        fernFilepath: createFernFilepath([name]),
        name: casingsGenerator.generateName(name),
        displayName: undefined,
        service: undefined,
        types: [],
        errors: [],
        subpackages: [],
        hasEndpointsInTree: true,
        websocket: undefined,
        webhooks: undefined,
        navigationConfig: undefined,
        docs: undefined
    };
}

function createMockWrapperService() {
    return {
        getReferenceToOptions: () => ts.factory.createPropertyAccessExpression(ts.factory.createThis(), "_options")
        // biome-ignore lint/suspicious/noExplicitAny: test mock for GeneratedSdkClientClassImpl
    } as any;
}

function createMockContext(opts?: { wrappedClassName?: string; serviceClassName?: string }) {
    const wrappedClassName = opts?.wrappedClassName ?? "UsersClient";
    return {
        sdkClientClass: {
            getGeneratedSdkClientClass: () => ({
                instantiate: ({
                    referenceToClient,
                    referenceToOptions
                }: {
                    referenceToClient: ts.Expression;
                    referenceToOptions: ts.Expression;
                }) => ts.factory.createNewExpression(referenceToClient, undefined, [referenceToOptions])
            }),
            getReferenceToClientClass: (_id: unknown, importOpts?: { importAlias?: string }) => ({
                getTypeNode: (opts?: { isForComment?: boolean }) =>
                    ts.factory.createTypeReferenceNode(importOpts?.importAlias ?? wrappedClassName),
                getExpression: () => ts.factory.createIdentifier(importOpts?.importAlias ?? wrappedClassName)
            })
        },
        case: caseConverter
        // biome-ignore lint/suspicious/noExplicitAny: test mock for FileContext
    } as any;
}

function createEmptyClassStructure(name: string): ClassDeclarationStructure & {
    properties: NonNullable<ClassDeclarationStructure["properties"]>;
    ctors: NonNullable<ClassDeclarationStructure["ctors"]>;
    methods: NonNullable<ClassDeclarationStructure["methods"]>;
    getAccessors: NonNullable<ClassDeclarationStructure["getAccessors"]>;
} {
    return {
        kind: StructureKind.Class,
        name,
        properties: [],
        ctors: [],
        methods: [],
        getAccessors: [],
        isExported: true
    };
}

// ── Tests ──────────────────────────────────────────────────────────────

describe("GeneratedWrappedService", () => {
    describe("constructor", () => {
        it("creates instance with required properties", () => {
            const service = new GeneratedWrappedService({
                wrapperService: createMockWrapperService(),
                wrappedSubpackageId: "subpackage_users",
                wrappedSubpackage: createSubpackage("users")
            });
            expect(service).toBeDefined();
        });
    });

    describe("addToServiceClass", () => {
        it("adds cached property and getter to class structure", () => {
            const service = new GeneratedWrappedService({
                wrapperService: createMockWrapperService(),
                wrappedSubpackageId: "subpackage_users",
                wrappedSubpackage: createSubpackage("users")
            });

            const class_ = createEmptyClassStructure("RootClient");
            const context = createMockContext();

            service.addToServiceClass({ isRoot: true, class_, context });

            // Should add a protected cached property
            expect(class_.properties).toHaveLength(1);
            // biome-ignore lint/style/noNonNullAssertion: Safe - value asserted above
            expect(class_.properties[0]!.name).toBe("_users");
            // biome-ignore lint/style/noNonNullAssertion: Safe - value asserted above
            expect(class_.properties[0]!.scope).toBe(Scope.Protected);

            // Should add a public getter
            expect(class_.getAccessors).toHaveLength(1);
            // biome-ignore lint/style/noNonNullAssertion: Safe - value asserted above
            expect(class_.getAccessors[0]!.name).toBe("users");
            // biome-ignore lint/style/noNonNullAssertion: Safe - value asserted above
            expect(class_.getAccessors[0]!.scope).toBe(Scope.Public);
        });

        it("generates getter with nullish coalescing assignment (??=)", () => {
            const service = new GeneratedWrappedService({
                wrapperService: createMockWrapperService(),
                wrappedSubpackageId: "subpackage_users",
                wrappedSubpackage: createSubpackage("users")
            });

            const class_ = createEmptyClassStructure("RootClient");
            const context = createMockContext();

            service.addToServiceClass({ isRoot: true, class_, context });

            // biome-ignore lint/style/noNonNullAssertion: Safe - value asserted above
            const getter = class_.getAccessors[0]!;
            expect(getter.statements).toBeDefined();
            const statementsText = (getter.statements as string[]).join("\n");
            // Should contain ??= for lazy initialization
            expect(statementsText).toContain("??=");
            expect(statementsText).toContain("this._users");
        });

        it("generates cached property type as WrappedType | undefined", () => {
            const service = new GeneratedWrappedService({
                wrapperService: createMockWrapperService(),
                wrappedSubpackageId: "subpackage_users",
                wrappedSubpackage: createSubpackage("users")
            });

            const class_ = createEmptyClassStructure("RootClient");
            const context = createMockContext();

            service.addToServiceClass({ isRoot: true, class_, context });

            // biome-ignore lint/style/noNonNullAssertion: Safe - value asserted above
            const prop = class_.properties[0]!;
            expect(prop.type).toContain("undefined");
            expect(prop.type).toContain("UsersClient");
        });

        it("uses import alias when wrapped class name matches service class name", () => {
            // When wrappedServiceClassName === serviceClass.name, it should add "_" suffix
            const service = new GeneratedWrappedService({
                wrapperService: createMockWrapperService(),
                wrappedSubpackageId: "subpackage_users",
                wrappedSubpackage: createSubpackage("users")
            });

            const class_ = createEmptyClassStructure("UsersClient");
            const context = createMockContext({ wrappedClassName: "UsersClient" });

            service.addToServiceClass({ isRoot: false, class_, context });

            // When names collide, should use import alias with "_" suffix
            // biome-ignore lint/style/noNonNullAssertion: Safe - value asserted above
            const prop = class_.properties[0]!;
            expect(prop.type).toContain("UsersClient_");
        });

        it("does not use import alias when names are different", () => {
            const service = new GeneratedWrappedService({
                wrapperService: createMockWrapperService(),
                wrappedSubpackageId: "subpackage_users",
                wrappedSubpackage: createSubpackage("users")
            });

            const class_ = createEmptyClassStructure("RootClient");
            const context = createMockContext({ wrappedClassName: "UsersClient" });

            service.addToServiceClass({ isRoot: true, class_, context });

            // biome-ignore lint/style/noNonNullAssertion: Safe - value asserted above
            const prop = class_.properties[0]!;
            // Should use the original name without alias
            expect(prop.type).toContain("UsersClient");
            expect(prop.type).not.toContain("UsersClient_");
        });
    });

    describe("getGetterName", () => {
        it("derives getter name from last fernFilepath part", () => {
            const service = new GeneratedWrappedService({
                wrapperService: createMockWrapperService(),
                wrappedSubpackageId: "subpackage_users",
                wrappedSubpackage: createSubpackage("users")
            });

            const class_ = createEmptyClassStructure("RootClient");
            const context = createMockContext();

            service.addToServiceClass({ isRoot: true, class_, context });

            // biome-ignore lint/style/noNonNullAssertion: Safe - value asserted above
            expect(class_.getAccessors[0]!.name).toBe("users");
        });

        it("handles nested subpackage paths", () => {
            const nestedSubpackage: FernIr.Subpackage = {
                fernFilepath: createFernFilepath(["admin", "permissions"]),
                name: casingsGenerator.generateName("permissions"),
                displayName: undefined,
                service: undefined,
                types: [],
                errors: [],
                subpackages: [],
                hasEndpointsInTree: true,
                websocket: undefined,
                webhooks: undefined,
                navigationConfig: undefined,
                docs: undefined
            };

            const service = new GeneratedWrappedService({
                wrapperService: createMockWrapperService(),
                wrappedSubpackageId: "subpackage_admin_permissions",
                wrappedSubpackage: nestedSubpackage
            });

            const class_ = createEmptyClassStructure("AdminClient");
            const context = createMockContext({ wrappedClassName: "PermissionsClient" });

            service.addToServiceClass({ isRoot: false, class_, context });

            // Should use last part of fernFilepath
            // biome-ignore lint/style/noNonNullAssertion: Safe - value asserted above
            expect(class_.getAccessors[0]!.name).toBe("permissions");
            // biome-ignore lint/style/noNonNullAssertion: Safe - value asserted above
            expect(class_.properties[0]!.name).toBe("_permissions");
        });

        it("throws when fernFilepath is empty", () => {
            const emptyFilepathSubpackage: FernIr.Subpackage = {
                fernFilepath: { allParts: [], packagePath: [], file: undefined },
                name: casingsGenerator.generateName("empty"),
                displayName: undefined,
                service: undefined,
                types: [],
                errors: [],
                subpackages: [],
                hasEndpointsInTree: true,
                websocket: undefined,
                webhooks: undefined,
                navigationConfig: undefined,
                docs: undefined
            };

            const service = new GeneratedWrappedService({
                wrapperService: createMockWrapperService(),
                wrappedSubpackageId: "subpackage_empty",
                wrappedSubpackage: emptyFilepathSubpackage
            });

            const class_ = createEmptyClassStructure("RootClient");
            const context = createMockContext();

            expect(() => service.addToServiceClass({ isRoot: true, class_, context })).toThrow(
                "Cannot generate wrapped service because FernFilepath is empty"
            );
        });
    });

    describe("getCachedMemberName", () => {
        it("prefixes getter name with underscore", () => {
            const service = new GeneratedWrappedService({
                wrapperService: createMockWrapperService(),
                wrappedSubpackageId: "subpackage_orders",
                wrappedSubpackage: createSubpackage("orders")
            });

            const class_ = createEmptyClassStructure("RootClient");
            const context = createMockContext({ wrappedClassName: "OrdersClient" });

            service.addToServiceClass({ isRoot: true, class_, context });

            // biome-ignore lint/style/noNonNullAssertion: Safe - value asserted above
            expect(class_.properties[0]!.name).toBe("_orders");
            // biome-ignore lint/style/noNonNullAssertion: Safe - value asserted above
            expect(class_.getAccessors[0]!.name).toBe("orders");
        });
    });
});
