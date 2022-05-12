import { getKeyForEnum } from "../types/enum/utils";

describe("getKeyForEnum", () => {
    test.each`
        original              | expected
        ${"request_response"} | ${"RequestResponse"}
        ${"REQUEST_RESPONSE"} | ${"RequestResponse"}
        ${"requestResponse"}  | ${"RequestResponse"}
        ${"RequestResponse"}  | ${"RequestResponse"}
        ${"a"}                | ${"A"}
        ${"ab"}               | ${"Ab"}
        ${"a_b_c_d_e"}        | ${"ABCDE"}
    `("$original -> $expected", ({ original, expected }) => {
        expect(
            getKeyForEnum({
                docs: undefined,
                value: original,
                name: original,
            })
        ).toBe(expected);
    });
});
