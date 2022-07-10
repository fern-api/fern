import { FailedResponse } from "@fern-fern/ir-model/services";
import { convertResponseErrors } from "../converters/services/convertResponseErrors";

describe("convertResponseErrors", () => {
    it("reference to an error in another file", () => {
        const actualResponseErrors = convertResponseErrors({
            errors: {
                errors: ["commons.UnauthorizedError"],
            },
            fernFilepath: ["path", "to"],
            imports: {
                commons: "./commons",
            },
        });

        const expectedResponseErrors: FailedResponse = {
            docs: undefined,
            errors: [
                {
                    discriminantValue: "UnauthorizedError",
                    docs: undefined,
                    error: {
                        fernFilepath: ["path", "to"],
                        name: "UnauthorizedError",
                    },
                },
            ],
        };

        expect(actualResponseErrors).toEqual(expectedResponseErrors);
    });
});
