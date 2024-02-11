import { itSchema } from "../../../__test__/utils/itSchema";
import { itValidateJson, itValidateParse } from "../../../__test__/utils/itValidate";
import { string } from "../../primitives";
import { set } from "../set";

describe("set", () => {
    itSchema("converts between raw list and parsed Set", set(string()), {
        raw: ["A", "B"],
        parsed: new Set(["A", "B"]),
    });

    itValidateParse("not a list", set(string()), 42, [
        {
            path: [],
            message: "Expected list. Received 42.",
        },
    ]);

    itValidateJson(
        "not a Set",
        set(string()),
        [],
        [
            {
                path: [],
                message: "Expected Set. Received list.",
            },
        ]
    );

    itValidateParse(
        "invalid item type",
        set(string()),
        [42],
        [
            {
                path: ["[0]"],
                message: "Expected string. Received 42.",
            },
        ]
    );

    itValidateJson("invalid item type", set(string()), new Set([42]), [
        {
            path: ["[0]"],
            message: "Expected string. Received 42.",
        },
    ]);
});
