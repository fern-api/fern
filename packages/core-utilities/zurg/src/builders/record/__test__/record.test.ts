import { itSchemaIdentity } from "../../../__test__/utils/itSchema";
import { itValidate } from "../../../__test__/utils/itValidate";
import { number, string } from "../../primitives";
import { record } from "../record";

describe("record", () => {
    itSchemaIdentity(record(string(), string()), { hello: "world" });
    itSchemaIdentity(record(number(), string()), { 42: "world" });

    itValidate(
        "non-record",
        record(number(), string()),
        [],
        [
            {
                path: [],
                message: "Not an object",
            },
        ]
    );

    itValidate("invalid key type", record(number(), string()), { hello: "world" }, [
        {
            path: ["hello (key)"],
            message: "Not a number",
        },
    ]);

    itValidate("invalid value type", record(string(), number()), { hello: "world" }, [
        {
            path: ["hello"],
            message: "Not a number",
        },
    ]);
});
