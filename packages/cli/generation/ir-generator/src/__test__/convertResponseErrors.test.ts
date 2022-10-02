import { ResponseErrors } from "@fern-fern/ir-model/services/commons";
import { convertResponseErrors } from "../converters/services/convertResponseErrors";
import { constructFernFileContext } from "../FernFileContext";
import { convertToFernFilepath } from "../utils/convertToFernFilepath";

describe("convertResponseErrors", () => {
    it("reference to an error in another file", () => {
        const actualResponseErrors = convertResponseErrors({
            errors: ["commons.UnauthorizedError"],
            file: constructFernFileContext({
                relativeFilepath: "path/to/other",
                serviceFile: {
                    imports: {
                        commons: "./commons",
                    },
                },
            }),
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
