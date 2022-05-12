import { FernFilepath, ResponseErrors } from "@fern-api/api";
import { convertResponseErrors } from "../converters/services/convertResponseErrors";

describe("convertResponseErrors", () => {
    it("reference to an error in another file", () => {
        const actualResponseErrors = convertResponseErrors({
            rawResponseErrors: {
                discriminant: "_some_other_discriminant",
                union: {
                    unauthorized: "commons.UnauthorizedError",
                },
            },
            fernFilepath: FernFilepath.of("path/to/service"),
            imports: {
                commons: "./commons",
            },
        });

        const expectedResponseErrors: ResponseErrors = {
            docs: undefined,
            discriminant: "_some_other_discriminant",
            possibleErrors: [
                {
                    discriminantValue: "unauthorized",
                    docs: undefined,
                    error: {
                        fernFilepath: FernFilepath.of("path/to/commons"),
                        name: "UnauthorizedError",
                    },
                },
            ],
        };

        expect(actualResponseErrors).toEqual(expectedResponseErrors);
    });
});
