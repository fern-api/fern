import { itSchemaIdentity } from "../../../__test__/utils/itSchema";
import { object } from "../../object";
import { number, string } from "../../primitives";
import { lazyObject } from "../lazyObject";

describe("lazy", () => {
    itSchemaIdentity(
        lazyObject(() => object({ foo: string() })),
        { foo: "hello" }
    );

    itSchemaIdentity(
        lazyObject(() => object({ foo: string() })).extend(object({ bar: number() })),
        {
            foo: "hello",
            bar: 42,
        },
        { title: "returned schema has object utils" }
    );
});
