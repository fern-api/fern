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
            message: "Not a list",
        },
    ]);

    itValidateJson(
        "not a Set",
        set(string()),
        [],
        [
            {
                path: [],
                message: "Not a Set",
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
                message: "Not a string",
            },
        ]
    );

    itValidateJson("invalid item type", set(string()), new Set([42]), [
        {
            path: ["[0]"],
            message: "Not a string",
        },
    ]);
});
