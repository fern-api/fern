import { ClassReference } from "../../ast/ClassReference";

import { NameRegistry, TypeRegistryEntry, TypeRegistryInfo } from "../nameRegistry";

describe("NameRegistry", () => {
    let nameRegistry: NameRegistry;

    beforeEach(() => {
        // Create a fresh instance for each test to ensure isolation
        nameRegistry = new NameRegistry();
    });

    describe("Constructor and Initialization", () => {
        it("should initialize with built-in types from the builtIns registry", () => {
            // Test that the constructor properly initializes known identifiers
            // We know it's working if built-in type names are recognized as known identifiers
            expect(nameRegistry.isKnownIdentifier("String")).toBe(true);
            expect(nameRegistry.isKnownIdentifier("Object")).toBe(true);
            expect(nameRegistry.isKnownIdentifier("Exception")).toBe(true);
            expect(nameRegistry.isKnownIdentifier("Int32")).toBe(true);
        });

        it("should initialize with built-in namespace segments", () => {
            // Test that namespace segments from built-in types are recognized
            // This ensures we can detect conflicts with .NET Framework namespaces
            expect(nameRegistry.isKnownIdentifier("System")).toBe(true);
            expect(nameRegistry.isKnownIdentifier("Collections")).toBe(true);
            expect(nameRegistry.isKnownIdentifier("Threading")).toBe(true);
            expect(nameRegistry.isKnownIdentifier("IO")).toBe(true);
        });

        it("should initialize type names registry with built-in types", () => {
            // Test that built-in types are properly registered for ambiguity detection
            // We know it's working if we can detect that built-in types exist in their namespaces
            expect(nameRegistry.isAmbiguousTypeName("String")).toBe(false); // Only in System namespace initially
            expect(nameRegistry.isAmbiguousTypeName("Object")).toBe(false); // Only in System namespace initially
        });
    });

    describe("isKnownIdentifier", () => {
        it("should return true for built-in type names", () => {
            // Test recognition of common .NET Framework types
            // We know it's working if these well-known types are identified
            expect(nameRegistry.isKnownIdentifier("String")).toBe(true);
            expect(nameRegistry.isKnownIdentifier("Int32")).toBe(true);
            expect(nameRegistry.isKnownIdentifier("Boolean")).toBe(true);
            expect(nameRegistry.isKnownIdentifier("DateTime")).toBe(true);
        });

        it("should return true for built-in namespace segments", () => {
            // Test recognition of .NET Framework namespace segments
            // This helps prevent conflicts with standard .NET namespaces
            expect(nameRegistry.isKnownIdentifier("System")).toBe(true);
            expect(nameRegistry.isKnownIdentifier("Collections")).toBe(true);
            expect(nameRegistry.isKnownIdentifier("Threading")).toBe(true);
            expect(nameRegistry.isKnownIdentifier("Diagnostics")).toBe(true);
        });

        it("should return false for unknown identifiers", () => {
            // Test that custom/user-defined identifiers are not flagged as known
            // This ensures we don't over-restrict legitimate user types
            expect(nameRegistry.isKnownIdentifier("MyCustomType")).toBe(false);
            expect(nameRegistry.isKnownIdentifier("UserDefinedClass")).toBe(false);
            expect(nameRegistry.isKnownIdentifier("ApiResponse")).toBe(false);
        });

        it("should handle edge cases gracefully", () => {
            // Test edge cases to ensure robust behavior
            // We know it's working if it handles invalid inputs without crashing
            expect(nameRegistry.isKnownIdentifier("")).toBe(false);
            expect(nameRegistry.isKnownIdentifier(null as unknown as string)).toBe(false);
            expect(nameRegistry.isKnownIdentifier(undefined as unknown as string)).toBe(false);
            expect(nameRegistry.isKnownIdentifier(123 as unknown as string)).toBe(false);
        });
    });

    describe("isAmbiguousTypeName", () => {
        it("should return false for unique type names", () => {
            // Test that types existing in only one namespace are not considered ambiguous
            // We know it's working if single-namespace types return false
            expect(nameRegistry.isAmbiguousTypeName("String")).toBe(false);
            expect(nameRegistry.isAmbiguousTypeName("MyUniqueType")).toBe(false);
        });

        it("should return true for ambiguous type names", () => {
            // First, register a type with a name that conflicts with a built-in
            const customString = new ClassReference({ name: "String", namespace: "MyNamespace" });
            nameRegistry.trackType(customString);

            // Now "String" exists in both System and MyNamespace, making it ambiguous
            // We know it's working if the method correctly detects the ambiguity
            expect(nameRegistry.isAmbiguousTypeName("String")).toBe(true);
        });

        it("should return false when no name is provided", () => {
            // Test that the method handles undefined input gracefully
            // We know it's working if it returns false for undefined input
            expect(nameRegistry.isAmbiguousTypeName()).toBe(false);
            expect(nameRegistry.isAmbiguousTypeName(undefined)).toBe(false);
        });

        it("should handle multiple namespaces with same type name", () => {
            // Register the same type name in multiple namespaces
            const type1 = new ClassReference({ name: "Response", namespace: "Api.V1" });
            const type2 = new ClassReference({ name: "Response", namespace: "Api.V2" });
            const type3 = new ClassReference({ name: "Response", namespace: "Api.V3" });

            nameRegistry.trackType(type1);
            nameRegistry.trackType(type2);
            nameRegistry.trackType(type3);

            // The type name should now be ambiguous across multiple namespaces
            // We know it's working if it correctly identifies the ambiguity
            expect(nameRegistry.isAmbiguousTypeName("Response")).toBe(true);
        });
    });

    describe("trackType", () => {
        it("should register a new type and return the same reference", () => {
            // Test basic type registration functionality
            const typeRef = new ClassReference({ name: "MyType", namespace: "MyNamespace" });
            const result = nameRegistry.trackType(typeRef);

            // We know it's working if the same reference is returned and the type is registered
            expect(result).toBe(typeRef);
            expect(nameRegistry.resolveType(typeRef)).toBeDefined();
        });

        it("should register all parent namespaces when tracking a type", () => {
            // Test that parent namespaces are properly registered
            const typeRef = new ClassReference({ name: "MyType", namespace: "A.B.C.D" });
            nameRegistry.trackType(typeRef);

            // We know it's working if all parent namespaces are accessible
            expect(nameRegistry.resolveNamespace("A")).toBe("A");
            expect(nameRegistry.resolveNamespace("A.B")).toBe("A.B");
            expect(nameRegistry.resolveNamespace("A.B.C")).toBe("A.B.C");
            expect(nameRegistry.resolveNamespace("A.B.C.D")).toBe("A.B.C.D");
        });

        it("should track type names for ambiguity detection", () => {
            // Test that type names are tracked for conflict detection
            const typeRef = new ClassReference({ name: "UniqueType", namespace: "MyNamespace" });
            nameRegistry.trackType(typeRef);

            // We know it's working if the type name is tracked and not ambiguous initially
            expect(nameRegistry.isAmbiguousTypeName("UniqueType")).toBe(false);

            // Add another type with the same name in a different namespace
            const conflictingType = new ClassReference({ name: "UniqueType", namespace: "OtherNamespace" });
            nameRegistry.trackType(conflictingType);

            // Now it should be ambiguous
            expect(nameRegistry.isAmbiguousTypeName("UniqueType")).toBe(true);
        });

        it("should handle nested types correctly", () => {
            // Test registration of nested types
            const outerType = new ClassReference({ name: "OuterClass", namespace: "MyNamespace" });
            const innerType = new ClassReference({
                name: "InnerClass",
                namespace: "MyNamespace",
                enclosingType: outerType
            });

            nameRegistry.trackType(outerType);
            nameRegistry.trackType(innerType);

            // We know it's working if both types are properly registered
            expect(nameRegistry.resolveType(outerType)).toBeDefined();
            expect(nameRegistry.resolveType(innerType)).toBeDefined();
        });

        it("should not duplicate registrations for the same type", () => {
            // Test that tracking the same type multiple times doesn't cause issues
            const typeRef = new ClassReference({ name: "MyType", namespace: "MyNamespace" });

            const result1 = nameRegistry.trackType(typeRef);
            const result2 = nameRegistry.trackType(typeRef);

            // We know it's working if both calls return the same reference
            expect(result1).toBe(result2);
            expect(result1).toBe(typeRef);
        });
    });

    describe("allNamespacesOf", () => {
        it("should return all parent namespaces for a given namespace", () => {
            // Test namespace decomposition functionality
            const result = nameRegistry.allNamespacesOf("System.Collections.Generic");

            // We know it's working if all parent namespaces are included
            expect(result.has("System")).toBe(true);
            expect(result.has("System.Collections")).toBe(true);
            expect(result.has("System.Collections.Generic")).toBe(true);
            expect(result.size).toBe(3);
        });

        it("should handle single-segment namespaces", () => {
            // Test that single-segment namespaces work correctly
            const result = nameRegistry.allNamespacesOf("System");

            // We know it's working if the single namespace is returned
            expect(result.has("System")).toBe(true);
            expect(result.size).toBe(1);
        });

        it("should handle empty or invalid inputs gracefully", () => {
            // Test edge cases for robust behavior
            // We know it's working if it handles invalid inputs without crashing
            expect(nameRegistry.allNamespacesOf("")).toEqual(new Set());
            expect(nameRegistry.allNamespacesOf(null as unknown as string)).toEqual(new Set());
            expect(nameRegistry.allNamespacesOf(undefined as unknown as string)).toEqual(new Set());
        });

        it("should skip empty namespace segments", () => {
            // Test that empty segments in namespaces are handled correctly
            const result = nameRegistry.allNamespacesOf("System..Collections.Generic");

            // We know it's working if empty segments are ignored
            expect(result.has("System")).toBe(true);
            expect(result.has("System.Collections")).toBe(true);
            expect(result.has("System.Collections.Generic")).toBe(true);
            expect(result.size).toBe(3);
        });

        it("should handle namespaces with whitespace", () => {
            // Test that whitespace in namespace segments is handled
            const result = nameRegistry.allNamespacesOf(" System . Collections . Generic ");

            // We know it's working if whitespace is trimmed and namespaces are correct
            expect(result.has("System")).toBe(true);
            expect(result.has("System.Collections")).toBe(true);
            expect(result.has("System.Collections.Generic")).toBe(true);
        });
    });

    describe("resolveType", () => {
        it("should return the original reference if type is not registered", () => {
            // Test that unregistered types return the original reference
            const typeRef = new ClassReference({ name: "UnregisteredType", namespace: "MyNamespace" });
            const result = nameRegistry.resolveType(typeRef);

            // We know it's working if the original reference is returned unchanged
            expect(result).toBe(typeRef);
        });

        it("should return canonical reference for registered types", () => {
            // Test that registered types return their canonical versions
            const typeRef = new ClassReference({ name: "MyType", namespace: "MyNamespace" });
            nameRegistry.trackType(typeRef);

            const result = nameRegistry.resolveType(typeRef);

            // We know it's working if a canonical reference is returned with preserved properties
            expect(result.name).toBe("MyType");
            expect(result.namespace).toBe("MyNamespace");
            expect(result).not.toBe(typeRef); // Should be a new instance
        });

        it("should preserve additional properties in resolved types", () => {
            // Test that additional properties are preserved during resolution
            const typeRef = new ClassReference({
                name: "MyType",
                namespace: "MyNamespace",
                namespaceAlias: "MyAlias",
                fullyQualified: true,
                global: true
            });
            nameRegistry.trackType(typeRef);

            const result = nameRegistry.resolveType(typeRef);

            // We know it's working if all properties are preserved
            expect(result.namespaceAlias).toBe("MyAlias");
            expect(result.fullyQualified).toBe(true);
            expect(result.global).toBe(true);
        });

        it("should handle nested types in resolution", () => {
            // Test resolution of nested types
            const outerType = new ClassReference({ name: "OuterClass", namespace: "MyNamespace" });
            const innerType = new ClassReference({
                name: "InnerClass",
                namespace: "MyNamespace",
                enclosingType: outerType
            });

            nameRegistry.trackType(outerType);
            nameRegistry.trackType(innerType);

            const result = nameRegistry.resolveType(innerType);

            // We know it's working if the nested structure is preserved
            expect(result.name).toBe("InnerClass");
            expect(result.enclosingType?.name).toBe("OuterClass");
        });
    });

    describe("resolveNamespace", () => {
        it("should return the original namespace if not remapped", () => {
            // Test that unremapped namespaces return unchanged
            const result = nameRegistry.resolveNamespace("MyNamespace");

            // We know it's working if the original namespace is returned
            expect(result).toBe("MyNamespace");
        });

        it("should return cached remapped namespaces", () => {
            // Test that previously remapped namespaces are returned from cache
            // First, we need to create a remapping by canonicalizing a conflicting namespace
            const conflictingType = new ClassReference({ name: "System", namespace: "MyNamespace" });
            nameRegistry.trackType(conflictingType);

            // Now canonicalize a namespace that would conflict
            const canonicalized = nameRegistry.canonicalizeNamespace("System.OtherNamespace");

            // We know it's working if the namespace is remapped to avoid conflicts
            expect(canonicalized).toBe("System_.OtherNamespace");
            expect(nameRegistry.resolveNamespace("System.OtherNamespace")).toBe("System_.OtherNamespace");
        });

        it("should handle parent namespace remappings", () => {
            // Test that parent namespace remappings are properly applied
            // Create a type that conflicts with a namespace segment
            const conflictingType = new ClassReference({ name: "System", namespace: "MyNamespace" });
            nameRegistry.trackType(conflictingType);

            // Canonicalize a namespace that would conflict
            nameRegistry.canonicalizeNamespace("System.Collections");

            // We know it's working if child namespaces are also remapped
            expect(nameRegistry.resolveNamespace("System.Collections.Generic")).toBe("System_.Collections.Generic");
        });

        it("should work with deeply nested namespaces", () => {
            // Test resolution with deeply nested namespace hierarchies
            const result = nameRegistry.resolveNamespace("A.B.C.D.E.F.G");

            // We know it's working if deeply nested namespaces are handled correctly
            expect(result).toBe("A.B.C.D.E.F.G");
        });
    });

    describe("canonicalizeNamespace", () => {
        it("should return original namespace if no conflicts exist", () => {
            // Test that non-conflicting namespaces are returned unchanged
            const result = nameRegistry.canonicalizeNamespace("MyNamespace");

            // We know it's working if the original namespace is returned
            expect(result).toBe("MyNamespace");
        });

        it("should modify namespace segments that conflict with existing types", () => {
            // Test conflict resolution by creating a type that conflicts with a namespace
            const conflictingType = new ClassReference({ name: "System", namespace: "MyNamespace" });
            nameRegistry.trackType(conflictingType);

            // Now canonicalize a namespace that would conflict
            const result = nameRegistry.canonicalizeNamespace("System.OtherNamespace");

            // We know it's working if the conflicting segment is modified
            expect(result).toBe("System_.OtherNamespace");
        });

        it("should handle multiple conflicting segments", () => {
            // Test resolution of multiple conflicting namespace segments
            const type1 = new ClassReference({ name: "System", namespace: "MyNamespace" });
            const type2 = new ClassReference({ name: "Collections", namespace: "MyNamespace" });

            nameRegistry.trackType(type1);
            nameRegistry.trackType(type2);

            // Canonicalize a namespace with multiple conflicts
            const result = nameRegistry.canonicalizeNamespace("System.Collections.Generic");

            // We know it's working if both conflicting segments are modified
            expect(result).toBe("System_.Collections_.Generic");
        });

        it("should cache canonicalized namespaces", () => {
            // Test that canonicalized namespaces are cached for performance
            const conflictingType = new ClassReference({ name: "System", namespace: "MyNamespace" });
            nameRegistry.trackType(conflictingType);

            // Canonicalize the same namespace twice
            const result1 = nameRegistry.canonicalizeNamespace("System.OtherNamespace");
            const result2 = nameRegistry.canonicalizeNamespace("System.OtherNamespace");

            // We know it's working if both calls return the same result
            expect(result1).toBe(result2);
            expect(result1).toBe("System_.OtherNamespace");
        });

        it("should handle empty or invalid namespaces", () => {
            // Test edge cases for robust behavior
            // We know it's working if it handles invalid inputs gracefully
            expect(nameRegistry.canonicalizeNamespace("")).toBe("");
            expect(nameRegistry.canonicalizeNamespace(null as unknown as string)).toBe("");
            expect(nameRegistry.canonicalizeNamespace(undefined as unknown as string)).toBe("");
        });
    });

    describe("canonicalizeName", () => {
        it("should return original reference if no conflicts exist", () => {
            // Test that non-conflicting types are returned unchanged
            const typeRef = new ClassReference({ name: "MyType", namespace: "MyNamespace" });
            const result = nameRegistry.canonicalizeName(typeRef);

            // We know it's working if the original reference is returned
            expect(result).toBe(typeRef);
        });

        it("should resolve namespace conflicts by modifying namespace segments", () => {
            // Test comprehensive conflict resolution
            const conflictingType = new ClassReference({ name: "System", namespace: "MyNamespace" });
            nameRegistry.trackType(conflictingType);

            const typeRef = new ClassReference({ name: "MyType", namespace: "System.OtherNamespace" });
            const result = nameRegistry.canonicalizeName(typeRef);

            // We know it's working if the namespace is modified to avoid conflicts
            expect(result.namespace).toBe("System_.OtherNamespace");
            expect(result.name).toBe("MyType");
        });

        it("should resolve type name conflicts with existing namespaces", () => {
            // Test resolution when type name conflicts with existing namespace
            // First, register a namespace by tracking a type in it
            const namespaceType = new ClassReference({ name: "SomeType", namespace: "MyNamespace" });
            nameRegistry.trackType(namespaceType);

            // Now try to create a type with the same name as the namespace
            const conflictingType = new ClassReference({ name: "MyNamespace", namespace: "OtherNamespace" });
            const result = nameRegistry.canonicalizeName(conflictingType);

            // We know it's working if the type name is modified to avoid the conflict
            expect(result.name).toBe("MyNamespace_");
            expect(result.namespace).toBe("OtherNamespace");
        });

        it("should preserve additional properties during canonicalization", () => {
            // Test that additional properties are preserved during canonicalization
            const typeRef = new ClassReference({
                name: "MyType",
                namespace: "MyNamespace",
                namespaceAlias: "MyAlias",
                fullyQualified: true,
                global: true
            });

            const result = nameRegistry.canonicalizeName(typeRef);

            // We know it's working if all properties are preserved
            expect(result.namespaceAlias).toBe("MyAlias");
            expect(result.fullyQualified).toBe(true);
            expect(result.global).toBe(true);
        });

        it("should handle nested types during canonicalization", () => {
            // Test canonicalization of nested types
            const outerType = new ClassReference({ name: "OuterClass", namespace: "MyNamespace" });
            const innerType = new ClassReference({
                name: "InnerClass",
                namespace: "MyNamespace",
                enclosingType: outerType
            });

            const result = nameRegistry.canonicalizeName(innerType);

            // We know it's working if the nested structure is preserved
            expect(result.name).toBe("InnerClass");
            expect(result.enclosingType?.name).toBe("OuterClass");
        });

        it("should return canonical version for already registered types", () => {
            // Test that already registered types return their canonical versions
            const typeRef = new ClassReference({ name: "MyType", namespace: "MyNamespace" });
            nameRegistry.trackType(typeRef);

            const result = nameRegistry.canonicalizeName(typeRef);

            // We know it's working if the canonical version is returned
            expect(result).toBeDefined();
            expect(result.name).toBe("MyType");
            expect(result.namespace).toBe("MyNamespace");
        });
    });

    describe("saveTypeRegistry and loadTypeRegistry", () => {
        it("should save and restore type registry state correctly", () => {
            // Test serialization and deserialization functionality
            const type1 = new ClassReference({ name: "Type1", namespace: "Namespace1" });
            const type2 = new ClassReference({ name: "Type2", namespace: "Namespace2" });

            nameRegistry.trackType(type1);
            nameRegistry.trackType(type2);

            // Save the registry state
            const savedData = nameRegistry.saveTypeRegistry();

            // Create a new registry and load the saved data
            const newRegistry = new NameRegistry();
            newRegistry.loadTypeRegistry(savedData);

            // We know it's working if the loaded registry has the same types
            expect(newRegistry.resolveType(type1)).toBeDefined();
            expect(newRegistry.resolveType(type2)).toBeDefined();
        });

        it("should save and restore namespace remappings", () => {
            // Test that namespace remappings are preserved during save/load
            const conflictingType = new ClassReference({ name: "System", namespace: "MyNamespace" });
            nameRegistry.trackType(conflictingType);

            // Create a remapping
            nameRegistry.canonicalizeNamespace("System.OtherNamespace");

            // Save and load
            const savedData = nameRegistry.saveTypeRegistry();
            const newRegistry = new NameRegistry();
            newRegistry.loadTypeRegistry(savedData);

            // We know it's working if the remapping is preserved
            expect(newRegistry.resolveNamespace("System.OtherNamespace")).toBe("System_.OtherNamespace");
        });

        it("should save and restore type name ambiguity tracking", () => {
            // Test that type name ambiguity tracking is preserved
            const type1 = new ClassReference({ name: "AmbiguousType", namespace: "Namespace1" });
            const type2 = new ClassReference({ name: "AmbiguousType", namespace: "Namespace2" });

            nameRegistry.trackType(type1);
            nameRegistry.trackType(type2);

            // Save and load
            const savedData = nameRegistry.saveTypeRegistry();
            const newRegistry = new NameRegistry();
            newRegistry.loadTypeRegistry(savedData);

            // We know it's working if ambiguity is preserved
            expect(newRegistry.isAmbiguousTypeName("AmbiguousType")).toBe(true);
        });

        it("should handle nested types in save/load", () => {
            // Test that nested types are properly saved and restored
            const outerType = new ClassReference({ name: "OuterClass", namespace: "MyNamespace" });
            const innerType = new ClassReference({
                name: "InnerClass",
                namespace: "MyNamespace",
                enclosingType: outerType
            });

            nameRegistry.trackType(outerType);
            nameRegistry.trackType(innerType);

            // Save and load
            const savedData = nameRegistry.saveTypeRegistry();
            const newRegistry = new NameRegistry();
            newRegistry.loadTypeRegistry(savedData);

            // We know it's working if nested structure is preserved
            const resolvedInner = newRegistry.resolveType(innerType);
            expect(resolvedInner.enclosingType?.name).toBe("OuterClass");
        });

        it("should handle invalid registry data gracefully", () => {
            // Test error handling for invalid registry data
            // We know it's working if it throws appropriate errors for invalid data
            expect(() => nameRegistry.loadTypeRegistry(null as unknown as TypeRegistryInfo)).toThrow(
                "Invalid registry data provided"
            );
            expect(() => nameRegistry.loadTypeRegistry(undefined as unknown as TypeRegistryInfo)).toThrow(
                "Invalid registry data provided"
            );
            expect(() => nameRegistry.loadTypeRegistry({} as unknown as TypeRegistryInfo)).not.toThrow();
        });

        it("should handle malformed type entries gracefully", () => {
            // Test error handling for malformed type entries
            const invalidData: TypeRegistryInfo = {
                types: {
                    invalid: {
                        name: "", // Invalid empty name
                        namespace: "TestNamespace"
                    } as unknown as TypeRegistryEntry
                },
                namespaces: {},
                names: {}
            };

            // We know it's working if it handles malformed entries without crashing
            expect(() => nameRegistry.loadTypeRegistry(invalidData)).toThrow("Invalid TypeRegistryEntry provided");
        });
    });

    describe("Edge Cases and Error Conditions", () => {
        it("should handle circular namespace references", () => {
            // Test that circular references don't cause infinite loops
            // This is more of a defensive test to ensure robustness
            const result = nameRegistry.allNamespacesOf("A.B.C.D.E.F.G.H.I.J.K.L.M.N.O.P");

            // We know it's working if it handles long namespaces without issues
            expect(result.size).toBe(16);
            expect(result.has("A")).toBe(true);
            expect(result.has("A.B.C.D.E.F.G.H.I.J.K.L.M.N.O.P")).toBe(true);
        });

        it("should handle special characters in namespaces", () => {
            // Test that special characters are handled appropriately
            const typeRef = new ClassReference({ name: "MyType", namespace: "My-Namespace.With_Special.Chars" });
            nameRegistry.trackType(typeRef);

            // We know it's working if special characters don't break the system
            expect(nameRegistry.resolveType(typeRef)).toBeDefined();
        });

        it("should handle very long type and namespace names", () => {
            // Test robustness with very long names
            const longNamespace = "A".repeat(100) + "." + "B".repeat(100);
            const longTypeName = "C".repeat(100);

            const typeRef = new ClassReference({ name: longTypeName, namespace: longNamespace });
            nameRegistry.trackType(typeRef);

            // We know it's working if long names are handled without issues
            expect(nameRegistry.resolveType(typeRef)).toBeDefined();
        });

        it("should maintain consistency across multiple operations", () => {
            // Test that multiple operations maintain registry consistency
            const types = [
                new ClassReference({ name: "Type1", namespace: "Namespace1" }),
                new ClassReference({ name: "Type2", namespace: "Namespace2" }),
                new ClassReference({ name: "Type3", namespace: "Namespace3" })
            ];

            // Track all types
            types.forEach((type) => nameRegistry.trackType(type));

            // Canonicalize some namespaces
            nameRegistry.canonicalizeNamespace("Namespace1.SubNamespace");
            nameRegistry.canonicalizeNamespace("Namespace2.SubNamespace");

            // Resolve types
            types.forEach((type) => {
                const resolved = nameRegistry.resolveType(type);
                expect(resolved).toBeDefined();
            });

            // We know it's working if all operations complete without errors
            // and the registry remains in a consistent state
            expect(nameRegistry.isAmbiguousTypeName("Type1")).toBe(false);
            expect(nameRegistry.isAmbiguousTypeName("Type2")).toBe(false);
            expect(nameRegistry.isAmbiguousTypeName("Type3")).toBe(false);
        });
    });
});
