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
                message: "Expected object. Received list.",
            },
        ]
    );

    itValidate("invalid key type", record(number(), string()), { hello: "world" }, [
        {
            path: ["hello (key)"],
            message: 'Expected number. Received "hello".',
        },
    ]);

    itValidate("invalid value type", record(string(), number()), { hello: "world" }, [
        {
            path: ["hello"],
            message: 'Expected number. Received "world".',
        },
    ]);
});
