import { ResponseErrors } from "@fern-fern/ir-model/services";
import { convertResponseErrors } from "../converters/services/convertResponseErrors";

describe("convertResponseErrors", () => {
    it("reference to an error in another file", () => {
        const actualResponseErrors = convertResponseErrors({
            errors: ["commons.UnauthorizedError"],
            fernFilepath: ["path", "to", "other"],
            imports: {
                commons: "./commons",
            },
        });

        const expectedResponseErrors: ResponseErrors = [
            {
                discriminantValue: "UnauthorizedError",
                docs: undefined,
                error: {
                    fernFilepath: ["path", "to", "commons"],
                    name: "UnauthorizedError",
                },
            },
        ];

        expect(actualResponseErrors).toEqual(expectedResponseErrors);
    });
});
