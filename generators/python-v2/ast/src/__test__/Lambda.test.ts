import { python } from "..";
import { ClassMethodType } from "../Method";
import { OperatorType } from "../OperatorType";
import { Writer } from "../core/Writer";

describe("Lambda", () => {
    let writer: Writer;

    beforeEach(() => {
        writer = new Writer();
    });

    describe("toString", () => {
        it("should generate a basic function with no args and a simple body", async () => {
            const method = python.lambda({
                body: python.TypeInstantiation.bool(true)
            });
            method.write(writer);
            expect(await writer.toStringFormatted()).toMatchSnapshot();
            expect(method.getReferences().length).toBe(0);
        });

        it("should generate a function with two args", async () => {
            const method = python.lambda({
                parameters: [python.lambdaParameter({ name: "a" }), python.lambdaParameter({ name: "b" })],
                body: python.operator({
                    lhs: python.reference({ name: "a" }),
                    operator: OperatorType.Add,
                    rhs: python.reference({ name: "b" })
                })
            });
            method.write(writer);
            expect(await writer.toStringFormatted()).toMatchSnapshot();
            expect(method.getReferences().length).toBe(2);
        });

        it("should generate a function with two args and initializers", async () => {
            const method = python.lambda({
                parameters: [
                    python.lambdaParameter({
                        name: "a",
                        initializer: python.TypeInstantiation.int(1)
                    }),
                    python.lambdaParameter({ name: "b", initializer: python.TypeInstantiation.int(2) })
                ],
                body: python.operator({
                    lhs: python.reference({ name: "a" }),
                    operator: OperatorType.Add,
                    rhs: python.reference({ name: "b" })
                })
            });
            method.write(writer);
            expect(await writer.toStringFormatted()).toMatchSnapshot();
            expect(method.getReferences().length).toBe(2);
        });
    });
});
