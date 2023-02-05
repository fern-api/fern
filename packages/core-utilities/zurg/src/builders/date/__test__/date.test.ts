import { itSchema } from "../../../__test__/utils/itSchema";
import { itValidateJson, itValidateParse } from "../../../__test__/utils/itValidate";
import { date } from "../date";

describe("date", () => {
    itSchema("converts between raw ISO string and parsed Date", date(), {
        raw: "2022-09-29T05:41:21.939Z",
        parsed: new Date("2022-09-29T05:41:21.939Z"),
    });

    itValidateParse("non-string", date(), 42, [
        {
            message: "Not an ISO 8601 date string",
            path: [],
        },
    ]);

    itValidateJson("non-Date", date(), "hello", [
        {
            message: "Not a Date object",
            path: [],
        },
    ]);
});
