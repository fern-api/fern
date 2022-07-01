import { FailedResponse } from "@fern-fern/ir-model/services";
import { convertFailedResponse } from "../converters/services/convertFailedResponse";

describe("convertResponseErrors", () => {
    it("reference to an error in another file", () => {
        const actualResponseErrors = convertFailedResponse({
            rawFailedResponse: {
                discriminant: "_some_other_discriminant",
                errors: ["commons.UnauthorizedError"],
            },
            fernFilepath: ["path", "to"],
            imports: {
                commons: "./commons",
            },
        });

        const expectedResponseErrors: FailedResponse = {
            docs: undefined,
            discriminant: "_some_other_discriminant",
            errorProperties: {
                errorInstanceId: "_errorInstanceId",
            },
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
