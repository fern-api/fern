import { FernFilepath, ResponseError } from "@fern-api/api";
import { convertResponseErrors } from "../converters/services/convertResponseErrors";

describe("convertResponseErrors", () => {
    it("reference to an error in another file", () => {
        const references = convertResponseErrors({
            rawResponseErrors: {
                union: {
                    unauthorized: "commons.UnauthorizedError",
                },
            },
            fernFilepath: FernFilepath.of("path/to/service"),
            imports: {
                commons: "./commons",
            },
        });

        const expectedReference: ResponseError = {
            docs: undefined,
            discriminantValue: "unauthorized",
            error: {
                name: "UnauthorizedError",
                fernFilepath: FernFilepath.of("path/to/commons"),
            },
        };

        expect(references).toEqual([expectedReference]);
    });
});
