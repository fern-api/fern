import { python } from "../../../src";
import { Writer } from "../core/Writer";
import { Reference } from "../Reference";
import { Class } from "../Class";
import { Method } from "../Method";
import { CodeBlock } from "../CodeBlock";
import { Type } from "../Type";

describe("PythonFile", () => {
    let writer: Writer;

    beforeEach(() => {
        writer = new Writer();
    });

    it("Add a class with no references", () => {
        const file = python.file({
            moduleName: "test_module",
            path: ["test"],
            name: "test_file"
        });

        const testClass = python.class_({ name: "TestClass" });
        file.addStatement(testClass);

        file.write(writer);
        expect(writer.toString()).toMatchSnapshot();
    });

    it("Add a class with a reference that uses a python standard library reference", () => {
        const file = python.file({
            moduleName: "test_module",
            path: ["test"],
            name: "test_file"
        });

        const testClass = python.class_({
            name: "TestClass"
        });
        testClass.addBody(python.codeBlock("flat_list = list(itertools.chain([[1, 2], [3, 4]]))"));
        writer.addReference(python.reference({ modulePath: ["itertools"], name: "chain" }));

        file.addStatement(testClass);

        file.write(writer);
        expect(writer.toString()).toMatchSnapshot();
    });

    it("Add a class with a reference that uses a relative import", () => {
        const file = python.file({
            moduleName: "test_module",
            path: ["test"],
            name: "test_file"
        });

        const relativeRef = python.reference({
            modulePath: ["test_module", "other_file"],
            name: "OtherClass"
        });
        const testClass = python.class_({
            name: "TestClass",
            extends_: [relativeRef]
        });
        writer.addReference(relativeRef);
        file.addStatement(testClass);

        // Add a class with a deeply nested relative import
        const deeplyNestedRef = python.reference({
            modulePath: ["test_module", "nested", "very", "deep", "file"],
            name: "DeepClass"
        });
        const deeplyNestedClass = python.class_({
            name: "DeeplyNestedTestClass",
            extends_: [deeplyNestedRef]
        });
        writer.addReference(deeplyNestedRef);
        file.addStatement(deeplyNestedClass);

        file.write(writer);
        expect(writer.toString()).toMatchSnapshot();
    });

    it("Add a Method", () => {
        const file = python.file({
            moduleName: "test_module",
            path: ["test"],
            name: "test_file"
        });

        const testMethod = new Method({
            name: "test_method",
            parameters: [],
            return_: python.Type.str()
        });
        file.addStatement(testMethod);

        file.write(writer);
        expect(writer.toString()).toMatchSnapshot();
    });

    it("Add a code block", () => {
        const file = python.file({
            moduleName: "test_module",
            path: ["test"],
            name: "test_file"
        });

        const codeBlock = new CodeBlock("print('Hello, World!')");
        file.addStatement(codeBlock);

        file.write(writer);
        expect(writer.toString()).toMatchSnapshot();
    });
});
