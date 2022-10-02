import { itSchemaIdentity } from "../../../__test__/utils/itSchema";
import { stringLiteral } from "../../literals";
import { boolean, string } from "../../primitives";
import { object } from "../object";

describe("extend", () => {
    itSchemaIdentity(
        object({
            foo: string(),
        }).extend(
            object({
                bar: stringLiteral("bar"),
            })
        ),
        {
            foo: "",
            bar: "bar",
        } as const,
        {
            title: "extended properties are included in schema",
        }
    );

    itSchemaIdentity(
        object({
            foo: string(),
        })
            .extend(
                object({
                    bar: stringLiteral("bar"),
                })
            )
            .extend(
                object({
                    baz: boolean(),
                })
            ),
        {
            foo: "",
            bar: "bar",
            baz: true,
        } as const,
        {
            title: "extensions can be extended",
        }
    );

    describe("compile", () => {
        // eslint-disable-next-line jest/expect-expect
        it("doesn't compile with non-object schema", () => {
            () =>
                object({
                    foo: string(),
                })
                    // @ts-expect-error
                    .extend([]);
        });
    });
});
