import { itSchemaIdentity } from "../../../__test__/utils/itSchema";
import { object } from "../../object";
import { number, string } from "../../primitives";
import { lazyObject } from "../lazyObject";

describe("lazy", () => {
    it("doesn't run immediately", () => {
        let wasRun = false;
        lazyObject(() => {
            wasRun = true;
            return object({ foo: string() });
        });
        expect(wasRun).toBe(false);
    });

    itSchemaIdentity(
        lazyObject(() => object({ foo: string() })),
        { foo: "hello" }
    );

    itSchemaIdentity(
        lazyObject(() => object({ foo: string() })).extend({ bar: number() }),
        {
            foo: "hello",
            bar: 42,
        },
        { title: "returned schema has object utils" }
    );
});
