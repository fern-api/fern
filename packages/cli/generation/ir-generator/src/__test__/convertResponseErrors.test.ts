import { ResponseErrors } from "@fern-fern/ir-model/http";
import { constructCasingsGenerator } from "../casings/CasingsGenerator";
import { convertResponseErrors } from "../converters/services/convertResponseErrors";
import { constructFernFileContext } from "../FernFileContext";
import { convertToFernFilepath } from "../utils/convertToFernFilepath";

describe("convertResponseErrors", () => {
    it("reference to an error in another file", () => {
        const casingsGenerator = constructCasingsGenerator(undefined);
        const actualResponseErrors = convertResponseErrors({
            errors: ["commons.UnauthorizedError"],
            file: constructFernFileContext({
                relativeFilepath: "path/to/other",
                serviceFile: {
                    imports: {
                        commons: "./commons",
                    },
                },
                casingsGenerator,
            }),
        });

        const expectedResponseErrors: ResponseErrors = [
            {
                docs: undefined,
                error: {
                    errorId: "path/to/commons:errors/UnauthorizedError",
                    fernFilepath: convertToFernFilepath({ relativeFilepath: "path/to/commons", casingsGenerator }),
                    name: {
                        originalName: "UnauthorizedError",
                        camelCase: {
                            safeName: "unauthorizedError",
                            unsafeName: "unauthorizedError",
                        },
                        pascalCase: {
                            safeName: "UnauthorizedError",
                            unsafeName: "UnauthorizedError",
                        },
                        snakeCase: {
                            safeName: "unauthorized_error",
                            unsafeName: "unauthorized_error",
                        },
                        screamingSnakeCase: {
                            safeName: "UNAUTHORIZED_ERROR",
                            unsafeName: "UNAUTHORIZED_ERROR",
                        },
                    },
                },
            },
        ];

        expect(actualResponseErrors).toEqual(expectedResponseErrors);
    });
});
