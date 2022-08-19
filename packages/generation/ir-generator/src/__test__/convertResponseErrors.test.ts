import { RelativeFilePath } from "@fern-api/core-utils";
import { ResponseErrors } from "@fern-fern/ir-model/services";
import { convertResponseErrors } from "../converters/services/convertResponseErrors";
import { convertToFernFilepath } from "../utils/convertToFernFilepath";

describe("convertResponseErrors", () => {
    it("reference to an error in another file", () => {
        const actualResponseErrors = convertResponseErrors({
            errors: ["commons.UnauthorizedError"],
            fernFilepath: convertToFernFilepath(RelativeFilePath.of("path/to/other")),
            imports: {
                commons: RelativeFilePath.of("./commons"),
            },
        });

        const expectedResponseErrors: ResponseErrors = [
            {
                docs: undefined,
                error: {
                    fernFilepath: convertToFernFilepath(RelativeFilePath.of("path/to/commons")),
                    name: "UnauthorizedError",
                },
            },
        ];

        expect(actualResponseErrors).toEqual(expectedResponseErrors);
    });
});
