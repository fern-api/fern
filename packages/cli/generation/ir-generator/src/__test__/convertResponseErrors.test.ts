import { RelativeFilePath } from "@fern-api/fs-utils";
import { ResponseErrors } from "@fern-api/ir-sdk";
import { constructCasingsGenerator } from "../casings/CasingsGenerator";
import { convertResponseErrors } from "../converters/services/convertResponseErrors";
import { constructFernFileContext } from "../FernFileContext";
import { convertToFernFilepath } from "../utils/convertToFernFilepath";

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
                    name: {
                        originalName: "UnauthorizedError",
                        camelCase: {
                            safeName: "unauthorizedError",
                            unsafeName: "unauthorizedError"
                        },
                        pascalCase: {
                            safeName: "UnauthorizedError",
                            unsafeName: "UnauthorizedError"
                        },
                        snakeCase: {
                            safeName: "unauthorized_error",
                            unsafeName: "unauthorized_error"
                        },
                        screamingSnakeCase: {
                            safeName: "UNAUTHORIZED_ERROR",
                            unsafeName: "UNAUTHORIZED_ERROR"
                        }
                    }
                }
            }
        ];

        expect(actualResponseErrors).toEqual(expectedResponseErrors);
    });
});
