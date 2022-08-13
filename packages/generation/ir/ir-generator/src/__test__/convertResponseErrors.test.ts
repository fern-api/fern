import { ResponseErrors } from "@fern-fern/ir-model/services";
import { convertResponseErrors } from "../converters/services/convertResponseErrors";
import { convertToFernFilepath } from "../utils/convertToFernFilepath";

describe("convertResponseErrors", () => {
    it("reference to an error in another file", () => {
        const actualResponseErrors = convertResponseErrors({
            errors: ["commons.UnauthorizedError"],
            fernFilepath: convertToFernFilepath("path/to/other"),
            imports: {
                commons: "./commons",
            },
        });

        const expectedResponseErrors: ResponseErrors = [
            {
                docs: undefined,
                error: {
                    fernFilepath: convertToFernFilepath("path/to/commons"),
                    name: "UnauthorizedError",
                },
            },
        ];

        expect(actualResponseErrors).toEqual(expectedResponseErrors);
    });
});
