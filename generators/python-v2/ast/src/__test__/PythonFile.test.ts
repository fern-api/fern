import { expect } from "vitest";

import { python } from "..";
import { CodeBlock } from "../CodeBlock";
import { Method } from "../Method";
import { Writer } from "../core/Writer";

describe("PythonFile", () => {
    let writer: Writer;

    beforeEach(() => {
        writer = new Writer();
    });

    it("Add a class with no references", async () => {
        const file = python.file({
            path: ["test_module"]
        });

        const testClass = python.class_({ name: "TestClass" });
        file.addStatement(testClass);

        file.write(writer);
        expect(await writer.toStringFormatted()).toMatchSnapshot();
    });

    it("Add a class with a reference that uses a python standard library reference", async () => {
        const file = python.file({
            path: ["test_module"]
        });

        const testClass = python.class_({
            name: "TestClass"
        });
        testClass.addReference(python.reference({ modulePath: ["itertools"], name: "chain" }));
        testClass.add(python.codeBlock("flat_list = list(itertools.chain([[1, 2], [3, 4]]))"));

        file.addStatement(testClass);

        file.write(writer);
        expect(await writer.toStringFormatted()).toMatchSnapshot();
    });

    it("Add a class with a reference that uses a relative import", async () => {
        const file = python.file({
            path: ["my_module"]
        });

        const relativeRef = python.reference({
            modulePath: ["my_module", "level_1"],
            name: "OtherClass"
        });
        const testClass = python.class_({
            name: "TestClass",
            extends_: [relativeRef]
        });
        file.addStatement(testClass);

        // Add a class with a deeply nested relative import
        const deeplyNestedRef = python.reference({
            modulePath: ["my_module", "level_1", "level_2"],
            name: "DeepClass"
        });
        const deeplyNestedClass = python.class_({
            name: "DeeplyNestedTestClass",
            extends_: [deeplyNestedRef]
        });
        file.addStatement(deeplyNestedClass);

        file.write(writer);
        expect(await writer.toStringFormatted()).toMatchSnapshot();
    });

    it("Set a variable to a nested attribute of an imported reference", async () => {
        const file = python.file({
            path: ["test_module"]
        });

        const importedRef = python.reference({
            modulePath: ["external_module"],
            name: "ImportedClass",
            attribute: ["nested", "attribute"]
        });

        const field = python.field({
            name: "my_variable",
            type: python.Type.reference(importedRef)
        });

        file.addStatement(field);

        file.write(writer);
        expect(await writer.toStringFormatted()).toMatchSnapshot();
    });

    it("Add a Method", async () => {
        const file = python.file({
            path: ["test_module"]
        });

        const testMethod = new Method({
            name: "test_method",
            parameters: [],
            return_: python.Type.str()
        });
        file.addStatement(testMethod);

        file.write(writer);
        expect(await writer.toStringFormatted()).toMatchSnapshot();
    });

    it("Add a code block", async () => {
        const file = python.file({
            path: ["test_module"]
        });

        const codeBlock = new CodeBlock("print('Hello, World!')");
        file.addStatement(codeBlock);

        file.write(writer);
        expect(await writer.toStringFormatted()).toMatchSnapshot();
    });

    it("Add a class with an absolute import and alias", async () => {
        const file = python.file({
            path: ["test_module"]
        });

        const absoluteRef = python.reference({
            modulePath: ["external_module", "submodule"],
            name: "ExternalClass",
            alias: "AliasedClass"
        });
        const testClass = python.class_({
            name: "TestClassWithAlias",
            extends_: [absoluteRef]
        });
        file.addStatement(testClass);

        file.write(writer);
        expect(await writer.toStringFormatted()).toMatchSnapshot();
    });

    it("Add a class with a relative import and alias", async () => {
        const file = python.file({
            path: ["test_module", "subdir"]
        });

        const relativeRef = python.reference({
            modulePath: ["test_module", "test", "sibling_dir"],
            name: "SiblingClass",
            alias: "AliasedSibling"
        });
        const testClass = python.class_({
            name: "TestClassWithRelativeAlias",
            extends_: [relativeRef]
        });
        file.addStatement(testClass);

        file.write(writer);
        expect(await writer.toStringFormatted()).toMatchSnapshot();
    });

    it("Add a class that inherits from a class imported from another file", async () => {
        const file = python.file({
            path: ["test_module"]
        });

        const baseClassRef = python.reference({
            modulePath: ["test_module", "base"],
            name: "BaseClass"
        });

        const derivedClass = python.class_({
            name: "DerivedClass",
            extends_: [baseClassRef]
        });

        file.addStatement(derivedClass);

        file.write(writer);
        expect(await writer.toStringFormatted()).toMatchSnapshot();
    });

    it("Add a field with a list of reference type and initializer", async () => {
        const file = python.file({
            path: ["test_module"]
        });

        const carRef = python.reference({
            name: "Car",
            modulePath: ["test_module", "cars"]
        });

        const carsField = python.field({
            name: "cars",
            type: python.Type.list(python.Type.reference(carRef)),
            initializer: python.codeBlock("[Car(), Car()]")
        });

        file.addStatement(carsField);

        file.write(writer);
        expect(await writer.toStringFormatted()).toMatchSnapshot();
    });

    it("Multiple imports from the same module should work", async () => {
        const file = python.file({
            path: ["test_module"]
        });

        const unionField = python.field({
            name: "variable",
            type: python.Type.union([python.Type.list(python.Type.str()), python.Type.set(python.Type.str())])
        });

        file.addStatement(unionField);

        file.write(writer);
        expect(await writer.toStringFormatted()).toMatchSnapshot();
    });

    it("Ensure we don't duplicate imports", async () => {
        const file = python.file({
            path: ["test_module"]
        });

        const varAField = python.field({
            name: "var_a",
            type: python.Type.list(python.Type.str())
        });

        const varBField = python.field({
            name: "var_b",
            type: python.Type.list(python.Type.str())
        });

        file.addStatement(varAField);
        file.addStatement(varBField);

        file.write(writer);
        expect(await writer.toStringFormatted()).toMatchSnapshot();
    });

    it("References to other nodes in same module in __init__.py work", async () => {
        const file = python.file({
            path: ["root", "car"],
            isInitFile: true
        });

        const carRef = python.reference({
            name: "Train",
            modulePath: ["root", "trains"]
        });

        const exportField = python.field({
            name: "exported_car",
            type: python.Type.reference(carRef)
        });

        file.addStatement(exportField);

        file.write(writer);
        expect(await writer.toStringFormatted()).toMatchSnapshot();
    });

    it("Initialize with a statement containing a reference", async () => {
        const field = python.field({
            name: "my_id",
            initializer: python.TypeInstantiation.uuid("1234")
        });

        const file = python.file({
            path: ["root"],
            statements: [field]
        });

        file.write(writer);
        expect(await writer.toStringFormatted()).toMatchSnapshot();
        expect(file.getReferences()).toHaveLength(1);
    });

    it("Write top of file comments", async () => {
        const file = python.file({
            path: ["root"],
            comments: [
                python.comment({ docs: "!/usr/bin/env python" }),
                python.comment({ docs: "flake8: noqa: F401, F403" })
            ],
            statements: [
                python.field({
                    name: "my_id",
                    initializer: python.TypeInstantiation.uuid("1234")
                })
            ]
        });

        file.write(writer);
        expect(await writer.toStringFormatted()).toMatchSnapshot();
        expect(file.getReferences()).toHaveLength(1);
    });

    it("Write star imports", async () => {
        const file = python.file({
            path: ["root"],
            comments: [python.comment({ docs: "flake8: noqa: F401, F403" })],
            imports: [
                python.starImport({ modulePath: ["root", "my_module_a"] }),
                python.starImport({ modulePath: ["root", "my_module_b"] })
            ],
            statements: [
                python.field({
                    name: "my_id",
                    initializer: python.TypeInstantiation.uuid("1234")
                })
            ]
        });

        file.write(writer);
        expect(await writer.toStringFormatted()).toMatchSnapshot();
        expect(file.getReferences()).toHaveLength(3);
    });

    it("Write duplicative import names", async () => {
        const file = python.file({ path: ["root"] });

        const local_class = python.class_({
            name: "Car"
        });

        local_class.add(
            python.field({
                name: "car",
                initializer: python.instantiateClass({
                    classReference: python.reference({
                        modulePath: ["root", "cars"],
                        name: "Car"
                    }),
                    arguments_: []
                })
            })
        );

        local_class.add(
            python.field({
                name: "car",
                initializer: python.instantiateClass({
                    classReference: python.reference({
                        modulePath: ["root", "transportation", "vehicles"],
                        name: "Car"
                    }),
                    arguments_: []
                })
            })
        );

        local_class.add(
            python.field({
                name: "automobile",
                initializer: python.instantiateClass({
                    classReference: python.reference({
                        modulePath: ["root", "automobiles"],
                        name: "Car"
                    }),
                    arguments_: []
                })
            })
        );

        local_class.add(
            python.field({
                name: "vehicle",
                initializer: python.instantiateClass({
                    classReference: python.reference({
                        modulePath: ["root", "vehicles", "automobiles"],
                        name: "Car"
                    }),
                    arguments_: []
                })
            })
        );

        file.addStatement(local_class);

        file.write(writer);
        expect(await writer.toStringFormatted()).toMatchSnapshot();
        expect(file.getReferences()).toHaveLength(4);
    });
});
