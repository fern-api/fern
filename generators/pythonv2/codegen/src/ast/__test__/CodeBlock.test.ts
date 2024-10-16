import { python } from "../..";
import { Writer } from "../core/Writer";

describe("CodeBlock", () => {
    let writer: Writer;

    beforeEach(() => {
        writer = new Writer();
    });

    describe("toString", () => {
        it("returns an empty string for an empty code block", () => {
            const codeBlock = python.codeBlock("");
            expect(codeBlock.toString()).toMatchSnapshot();
        });

        it("returns a single line of code", () => {
            const codeBlock = python.codeBlock('print("Hello, World!")');
            expect(codeBlock.toString()).toMatchSnapshot();
        });

        it("returns multiple lines of code", () => {
            const codeBlock = python.codeBlock(`\
def greet(name):
    return f"Hello, {name}!"

print(greet("Alice"))\
`);
            expect(codeBlock.toString()).toMatchSnapshot();
        });

        it("preserves indentation", () => {
            const codeBlock = python.codeBlock(`\
if True:
    print("Indented")
    if False:
        print("Nested indentation")\
`);
            expect(codeBlock.toString()).toMatchSnapshot();
        });
    });
});
