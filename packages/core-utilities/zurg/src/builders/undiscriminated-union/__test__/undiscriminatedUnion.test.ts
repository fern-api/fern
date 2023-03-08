import { itSchema, itSchemaIdentity } from "../../../__test__/utils/itSchema";
import { object, property } from "../../object";
import { number, string } from "../../primitives";
import { undiscriminatedUnion } from "../undiscriminatedUnion";

describe("undiscriminatedUnion", () => {
    itSchemaIdentity(undiscriminatedUnion([string(), number()]), "hello world");

    itSchemaIdentity(undiscriminatedUnion([object({ hello: string() }), object({ goodbye: string() })]), {
        goodbye: "foo",
    });

    itSchema(
        "Correctly transforms",
        undiscriminatedUnion([object({ hello: string() }), object({ helloWorld: property("hello_world", string()) })]),
        {
            raw: { hello_world: "foo " },
            parsed: { helloWorld: "foo " },
        }
    );

    describe("compile", () => {
        // eslint-disable-next-line jest/expect-expect
        it("doesn't compile with zero members", () => {
            // @ts-expect-error
            () => undiscriminatedUnion([]);
        });
    });
});
