import { ResponseErrors } from "@fern-fern/ir-model/services/commons";
import { constructCasingsGenerator } from "../casings/CasingsGenerator";
import { convertResponseErrors } from "../converters/services/convertResponseErrors";
import { constructFernFileContext } from "../FernFileContext";
import { convertToFernFilepath, convertToFernFilepathV2 } from "../utils/convertToFernFilepath";

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
                    fernFilepath: convertToFernFilepath({ relativeFilepath: "path/to/commons", casingsGenerator }),
                    fernFilepathV2: convertToFernFilepathV2({ relativeFilepath: "path/to/commons", casingsGenerator }),
                    name: "UnauthorizedError",
                    nameV2: {
                        originalValue: "UnauthorizedError",
                        camelCase: "unauthorizedError",
                        pascalCase: "UnauthorizedError",
                        snakeCase: "unauthorized_error",
                        screamingSnakeCase: "UNAUTHORIZED_ERROR",
                    },
                    nameV3: {
                        unsafeName: {
                            originalValue: "UnauthorizedError",
                            camelCase: "unauthorizedError",
                            pascalCase: "UnauthorizedError",
                            snakeCase: "unauthorized_error",
                            screamingSnakeCase: "UNAUTHORIZED_ERROR",
                        },
                        safeName: {
                            originalValue: "UnauthorizedError",
                            camelCase: "unauthorizedError",
                            pascalCase: "UnauthorizedError",
                            snakeCase: "unauthorized_error",
                            screamingSnakeCase: "UNAUTHORIZED_ERROR",
                        },
                    },
                },
            },
        ];

        expect(actualResponseErrors).toEqual(expectedResponseErrors);
    });
});
