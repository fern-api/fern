import { constructCasingsGenerator } from "@fern-api/casings-generator";
import { RelativeFilePath } from "@fern-api/fs-utils";
import { constructFernFileContext, convertResponseErrors, convertToFernFilepath } from "@fern-api/ir-generator";
import { ResponseErrors } from "@fern-api/ir-sdk";

describe("convertResponseErrors", () => {
    it("reference to an error in another file", () => {
        const casingsGenerator = constructCasingsGenerator({
            generationLanguage: undefined,
            keywords: undefined,
            smartCasing: false
        });
        const actualResponseErrors = convertResponseErrors({
            errors: ["commons.UnauthorizedError"],
            file: constructFernFileContext({
                relativeFilepath: RelativeFilePath.of("path/to/other"),
                definitionFile: {
                    imports: {
                        commons: "./commons"
                    }
                },
                casingsGenerator,
                rootApiFile: {
                    name: "api"
                }
            })
        });

        const expectedResponseErrors: ResponseErrors = [
            {
                docs: undefined,
                error: {
                    errorId: "error_path/to/commons:UnauthorizedError",
                    fernFilepath: convertToFernFilepath({
                        relativeFilepath: RelativeFilePath.of("path/to/commons"),
                        casingsGenerator
                    }),
                    name: "UnauthorizedError"
                }
            }
        ];

        expect(actualResponseErrors).toEqual(expectedResponseErrors);
    });
});
