import { python } from "..";
import { Writer } from "../core/Writer";

describe("CodeBlock", () => {
    let writer: Writer;

    beforeEach(() => {
        writer = new Writer();
    });

    describe("toString", () => {
        it("returns an empty string for an empty code block", async () => {
            const codeBlock = python.codeBlock("");
            codeBlock.write(writer);
            expect(await writer.toStringFormatted()).toMatchSnapshot();
        });

        it("returns a single line of code", async () => {
            const codeBlock = python.codeBlock('print("Hello, World!")');
            codeBlock.write(writer);
            expect(await writer.toStringFormatted()).toMatchSnapshot();
        });

        it("returns multiple lines of code", async () => {
            const codeBlock = python.codeBlock(`\
def greet(name):
    return f"Hello, {name}!"

print(greet("Alice"))\
`);
            codeBlock.write(writer);
            expect(await writer.toStringFormatted()).toMatchSnapshot();
        });

        it("preserves indentation", async () => {
            const codeBlock = python.codeBlock(`\
if True:
    print("Indented")
    if False:
        print("Nested indentation")\
`);
            codeBlock.write(writer);
            expect(await writer.toStringFormatted()).toMatchSnapshot();
        });
    });
});
