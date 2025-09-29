import { ClassReference } from "../../ast/ClassReference";
import { CSharp } from "../../csharp";
import { NameRegistry } from "../nameRegistry";

describe("NameRegistry", () => {
    let nameRegistry: NameRegistry;
    let mockCSharp: CSharp;

    beforeEach(() => {
        nameRegistry = new NameRegistry();
        // Create a minimal mock CSharp object
        mockCSharp = {
            classReference: (args: ClassReference.Args) => {
                const fullyQualifiedName = NameRegistry.fullyQualifiedNameOf({
                    name: args.name,
                    namespace: args.namespace,
                    enclosingType: args.enclosingType
                });
                return new ClassReference({ ...args, fullyQualifiedName }, mockCSharp);
            }
        } as CSharp;
    });

    // Helper function to create ClassReference with proper fullyQualifiedName
    const createClassReference = (name: string, namespace: string, enclosingType?: ClassReference): ClassReference => {
        const fullyQualifiedName = NameRegistry.fullyQualifiedNameOf({
            name,
            namespace,
            enclosingType
        });
        return new ClassReference({ name, namespace, enclosingType, fullyQualifiedName }, mockCSharp);
    };

    describe("constructor and initialization", () => {
        it("should initialize with built-in types and namespaces", () => {
            // Test that known identifiers are properly initialized
            expect(nameRegistry.isKnownIdentifier("String")).toBe(true);
            expect(nameRegistry.isKnownIdentifier("Object")).toBe(true);
            expect(nameRegistry.isKnownIdentifier("System")).toBe(true);
            expect(nameRegistry.isKnownIdentifier("Collections")).toBe(true);
        });

        it("should initialize type names registry with built-ins", () => {
            // Test that built-in type names are tracked for ambiguity detection
            expect(nameRegistry.isAmbiguousTypeName("String")).toBe(false); // Only in System namespace initially
            expect(nameRegistry.isAmbiguousTypeName("Object")).toBe(false);
        });
    });

    describe("isKnownIdentifier", () => {
        it("should return true for known C# identifiers", () => {
            expect(nameRegistry.isKnownIdentifier("String")).toBe(true);
            expect(nameRegistry.isKnownIdentifier("Collections")).toBe(true);
            expect(nameRegistry.isKnownIdentifier("System")).toBe(true);
        });

        it("should return false for unknown identifiers", () => {
            expect(nameRegistry.isKnownIdentifier("MyCustomType")).toBe(false);
            expect(nameRegistry.isKnownIdentifier("SomeRandomName")).toBe(false);
        });

        it("should handle edge cases", () => {
            expect(nameRegistry.isKnownIdentifier("")).toBe(false);
            expect(nameRegistry.isKnownIdentifier(null as unknown as string)).toBe(false);
            expect(nameRegistry.isKnownIdentifier(undefined as unknown as string)).toBe(false);
            expect(nameRegistry.isKnownIdentifier(123 as unknown as string)).toBe(false);
        });
    });

    describe("isKnownNamespace", () => {
        it("should return false for unknown namespaces initially", () => {
            expect(nameRegistry.isKnownNamespace("MyNamespace")).toBe(false);
            expect(nameRegistry.isKnownNamespace("System")).toBe(false);
        });

        it("should return true after tracking a type in a namespace", () => {
            const classRef = createClassReference("TestType", "MyNamespace");

            nameRegistry.trackType(classRef);
            expect(nameRegistry.isKnownNamespace("MyNamespace")).toBe(true);
        });

        it("should handle edge cases", () => {
            expect(nameRegistry.isKnownNamespace("")).toBe(false);
            expect(nameRegistry.isKnownNamespace(null as unknown as string)).toBe(false);
            expect(nameRegistry.isKnownNamespace(undefined as unknown as string)).toBe(false);
        });
    });

    describe("isRegistered", () => {
        it("should return false for unregistered types", () => {
            expect(nameRegistry.isRegistered("MyNamespace.MyType")).toBe(false);
        });

        it("should return true for registered types", () => {
            const classRef = createClassReference("MyType", "MyNamespace");

            nameRegistry.trackType(classRef);
            expect(nameRegistry.isRegistered("MyNamespace.MyType")).toBe(true);
        });
    });

    describe("isAmbiguousTypeName", () => {
        it("should return false for unique type names", () => {
            expect(nameRegistry.isAmbiguousTypeName("MyUniqueType")).toBe(false);
        });

        it("should return true for type names that exist in multiple namespaces", () => {
            // Register a type in one namespace
            const classRef1 = createClassReference("MyType", "Namespace1");
            nameRegistry.trackType(classRef1);

            // Register the same type name in another namespace
            const classRef2 = createClassReference("MyType", "Namespace2");
            nameRegistry.trackType(classRef2);

            expect(nameRegistry.isAmbiguousTypeName("MyType")).toBe(true);
        });

        it("should return false when no name is provided", () => {
            expect(nameRegistry.isAmbiguousTypeName()).toBe(false);
            expect(nameRegistry.isAmbiguousTypeName(undefined)).toBe(false);
        });
    });

    describe("fullyQualifiedNameOf", () => {
        it("should create fully qualified name for simple type", () => {
            const classRef = {
                name: "MyType",
                namespace: "MyNamespace"
            };

            expect(NameRegistry.fullyQualifiedNameOf(classRef)).toBe("MyNamespace.MyType");
        });

        it("should create fully qualified name for nested type", () => {
            const classRef = {
                name: "NestedType",
                namespace: "MyNamespace",
                enclosingType: {
                    name: "OuterType",
                    namespace: "MyNamespace",
                    fullyQualifiedName: "MyNamespace.OuterType"
                } as ClassReference
            };

            expect(NameRegistry.fullyQualifiedNameOf(classRef)).toBe("MyNamespace.OuterType.NestedType");
        });
    });

    describe("trackType", () => {
        it("should register a new type", () => {
            const classRef = createClassReference("TestType", "TestNamespace");

            const result = nameRegistry.trackType(classRef);

            expect(result).toBe(classRef);
            expect(nameRegistry.isRegistered("TestNamespace.TestType")).toBe(true);
            expect(nameRegistry.isKnownNamespace("TestNamespace")).toBe(true);
        });

        it("should track type names for ambiguity detection", () => {
            const classRef = createClassReference("TestType", "TestNamespace");

            nameRegistry.trackType(classRef);

            // The type name should be tracked
            expect(nameRegistry.isAmbiguousTypeName("TestType")).toBe(false); // Only one namespace initially
        });

        it("should register all parent namespaces", () => {
            const classRef = createClassReference("TestType", "A.B.C");

            nameRegistry.trackType(classRef);

            expect(nameRegistry.isKnownNamespace("A")).toBe(true);
            expect(nameRegistry.isKnownNamespace("A.B")).toBe(true);
            expect(nameRegistry.isKnownNamespace("A.B.C")).toBe(true);
        });

        it("should handle original fully qualified name parameter", () => {
            const classRef = createClassReference("TestType", "TestNamespace");

            nameRegistry.trackType(classRef, "OriginalNamespace.OriginalType");

            expect(nameRegistry.isRegistered("OriginalNamespace.OriginalType")).toBe(true);
            expect(nameRegistry.isRegistered("TestNamespace.TestType")).toBe(true);
        });
    });

    describe("allNamespacesOf", () => {
        it("should return all parent namespaces", () => {
            const result = nameRegistry.allNamespacesOf("A.B.C");

            expect(result).toEqual(new Set(["A", "A.B", "A.B.C"]));
        });

        it("should handle single namespace", () => {
            const result = nameRegistry.allNamespacesOf("SingleNamespace");

            expect(result).toEqual(new Set(["SingleNamespace"]));
        });

        it("should handle empty or invalid input", () => {
            expect(nameRegistry.allNamespacesOf("")).toEqual(new Set());
            expect(nameRegistry.allNamespacesOf(null as unknown as string)).toEqual(new Set());
            expect(nameRegistry.allNamespacesOf(undefined as unknown as string)).toEqual(new Set());
        });

        it("should skip empty parts", () => {
            const result = nameRegistry.allNamespacesOf("A..B.C");

            expect(result).toEqual(new Set(["A", "A.B", "A.B.C"]));
        });
    });

    describe("resolveNamespace", () => {
        it("should return original namespace if no remapping exists", () => {
            expect(nameRegistry.resolveNamespace("MyNamespace")).toBe("MyNamespace");
        });

        it("should return cached remapped namespace", () => {
            // Manually set a namespace remapping by creating a type that would cause remapping
            const conflictingType = createClassReference("OriginalNamespace", "SomeNamespace");
            nameRegistry.trackType(conflictingType);

            // This should cause the namespace to be remapped
            const result = nameRegistry.canonicalizeNamespace("OriginalNamespace");
            expect(nameRegistry.resolveNamespace("OriginalNamespace")).toBe(result);
        });

        it("should resolve parent namespace remappings", () => {
            // Create a type that would cause System to be remapped
            const systemType = createClassReference("System", "SomeNamespace");
            nameRegistry.trackType(systemType);

            // This should cause System to be remapped to System_
            const canonicalized = nameRegistry.canonicalizeNamespace("System");
            expect(nameRegistry.resolveNamespace("System.Collections")).toBe(`${canonicalized}.Collections`);
        });
    });

    describe("canonicalizeNamespace", () => {
        it("should return original namespace if no conflicts", () => {
            expect(nameRegistry.canonicalizeNamespace("MyNamespace")).toBe("MyNamespace");
        });

        it("should return cached result if already canonicalized", () => {
            // Create a type that would cause the namespace to be canonicalized
            const conflictingType = createClassReference("OriginalNamespace", "SomeNamespace");
            nameRegistry.trackType(conflictingType);

            // First call should canonicalize
            const firstResult = nameRegistry.canonicalizeNamespace("OriginalNamespace");
            // Second call should return cached result
            const secondResult = nameRegistry.canonicalizeNamespace("OriginalNamespace");
            expect(firstResult).toBe(secondResult);
        });

        it("should modify namespace segments that conflict with existing types", () => {
            // Register a type with the exact name "System" to conflict with the namespace segment
            // We need to create a type where the fully qualified name is exactly "System"
            const systemType = new ClassReference(
                {
                    name: "System",
                    namespace: "",
                    fullyQualifiedName: "System"
                },
                mockCSharp
            );
            nameRegistry.trackType(systemType);

            const result = nameRegistry.canonicalizeNamespace("System.MyNamespace");
            expect(result).toBe("System_.MyNamespace");
        });
    });

    describe("createClassReference", () => {
        it("should return existing class reference if already registered", () => {
            const originalRef = createClassReference("ExistingType", "ExistingNamespace");

            nameRegistry.trackType(originalRef);

            const newRef = nameRegistry.createClassReference(
                { name: "ExistingType", namespace: "ExistingNamespace" },
                "ExistingNamespace.ExistingType",
                mockCSharp
            );

            expect(newRef.name).toBe("ExistingType");
            expect(newRef.namespace).toBe("ExistingNamespace");
        });

        it("should create new class reference if not registered", () => {
            const classRef = nameRegistry.createClassReference(
                { name: "NewType", namespace: "NewNamespace" },
                "NewNamespace.NewType",
                mockCSharp
            );

            expect(classRef.name).toBe("NewType");
            expect(classRef.namespace).toBe("NewNamespace");
            expect(nameRegistry.isRegistered("NewNamespace.NewType")).toBe(true);
        });

        it("should resolve namespace conflicts by modifying type name", () => {
            // First, create a namespace "OtherNamespace.MyNamespace" by tracking a type in it
            const namespaceType = createClassReference("SomeType", "OtherNamespace.MyNamespace");
            nameRegistry.trackType(namespaceType);

            // Now try to create a type with the same fully qualified name as the existing namespace
            const classRef = nameRegistry.createClassReference(
                { name: "MyNamespace", namespace: "OtherNamespace" },
                "OtherNamespace.MyNamespace",
                mockCSharp
            );

            expect(classRef.name).toBe("MyNamespace_");
            expect(classRef.namespace).toBe("OtherNamespace");
        });
    });

    describe("addImplicitNamespace and related functionality", () => {
        it("should add implicit namespace", () => {
            nameRegistry.addImplicitNamespace("ImplicitNamespace");

            // This is tested indirectly through trackType behavior
            const classRef = createClassReference("TestType", "ImplicitNamespace.SubNamespace");

            nameRegistry.trackType(classRef);
            // The implicit namespace functionality should be working
            expect(nameRegistry.isKnownNamespace("ImplicitNamespace.SubNamespace")).toBe(true);
        });

        it("should track type names for implicit namespaces", () => {
            nameRegistry.addImplicitNamespace("Implicit");

            const classRef = createClassReference("TestType", "Implicit.SubNamespace");

            nameRegistry.trackType(classRef);

            // The type name "SubNamespace" should be tracked
            expect(nameRegistry.isAmbiguousTypeName("SubNamespace")).toBe(false); // Only one namespace initially
        });
    });

    describe("trackTypeName", () => {
        it("should track type name in namespace", () => {
            nameRegistry.trackTypeName("TestType", "TestNamespace");

            expect(nameRegistry.isAmbiguousTypeName("TestType")).toBe(false); // Only one namespace
        });

        it("should track multiple namespaces for same type name", () => {
            nameRegistry.trackTypeName("TestType", "Namespace1");
            nameRegistry.trackTypeName("TestType", "Namespace2");

            expect(nameRegistry.isAmbiguousTypeName("TestType")).toBe(true); // Multiple namespaces
        });
    });
});
