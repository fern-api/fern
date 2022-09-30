import { itSchema } from "../../../__test__/utils/itSchema";
import { date } from "../date";

describe("date", () => {
    itSchema("converts between raw ISO string and parsed Date", date(), {
        raw: "2022-09-29T05:41:21.939Z",
        parsed: new Date("2022-09-29T05:41:21.939Z"),
    });

    describe("compile", () => {
        describe("parse()", () => {
            // eslint-disable-next-line jest/expect-expect
            it("doesn't compile with non-string as input", () => {
                const schema = date();

                // @ts-expect-error
                () => schema.parse(42);
            });
        });

        describe("json()", () => {
            // eslint-disable-next-line jest/expect-expect
            it("doesn't compile with non-Date as input", () => {
                const schema = date();

                // @ts-expect-error
                () => schema.json("hello");
            });
        });
    });
});
