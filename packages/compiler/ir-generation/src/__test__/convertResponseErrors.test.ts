import { FailedResponse, FernFilepath, TypeReference } from "@fern-api/api";
import { convertFailedResponse } from "../converters/services/convertFailedResponse";

describe("convertResponseErrors", () => {
    it("reference to an error in another file", () => {
        const actualResponseErrors = convertFailedResponse({
            rawFailedResponse: {
                discriminant: "_some_other_discriminant",
                errors: {
                    unauthorized: "commons.UnauthorizedError",
                },
            },
            fernFilepath: FernFilepath.of("path/to/service"),
            imports: {
                commons: "./commons",
            },
        });

        const expectedResponseErrors: FailedResponse = {
            docs: undefined,
            discriminant: "_some_other_discriminant",
            errors: [
                {
                    discriminantValue: "unauthorized",
                    docs: undefined,
                    error: TypeReference.named({
                        fernFilepath: FernFilepath.of("path/to/commons"),
                        name: "UnauthorizedError",
                    }),
                },
            ],
        };

        expect(actualResponseErrors).toEqual(expectedResponseErrors);
    });
});
