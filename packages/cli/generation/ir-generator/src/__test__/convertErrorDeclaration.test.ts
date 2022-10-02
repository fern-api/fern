import { ErrorDeclaration } from "@fern-fern/ir-model/errors";
import { Type, TypeReference } from "@fern-fern/ir-model/types";
import { convertErrorDeclaration } from "../converters/convertErrorDeclaration";
import { constructFernFileContext } from "../FernFileContext";
import { convertToFernFilepath } from "../utils/convertToFernFilepath";
import { MockTypeResolver } from "./mocks/MockTypeResolver";

describe("convertErrorDeclaration", () => {
    it("reference to a type in another file", () => {
        const definition = convertErrorDeclaration({
            errorName: "UnauthorizedError",
            errorDeclaration: {
                type: {
                    properties: {
                        postId: "commons.PostId",
                    },
                },
            },
            file: constructFernFileContext({
                relativeFilepath: "path/to/other",
                serviceFile: {
                    imports: {
                        commons: "./commons",
                    },
                },
            }),
            typeResolver: MockTypeResolver,
        });

        const expectedDefinition: ErrorDeclaration = {
            docs: undefined,
            name: {
                name: "UnauthorizedError",
                fernFilepath: convertToFernFilepath("path/to/other"),
            },
            discriminantValue: {
                wireValue: "UnauthorizedError",
                originalValue: "UnauthorizedError",
                camelCase: "unauthorizedError",
                pascalCase: "UnauthorizedError",
                snakeCase: "unauthorized_error",
                screamingSnakeCase: "UNAUTHORIZED_ERROR",
            },
            http: undefined,
            type: Type.object({
                extends: [],
                properties: [
                    {
                        docs: undefined,
                        name: {
                            wireValue: "postId",
                            originalValue: "postId",
                            camelCase: "postId",
                            pascalCase: "PostId",
                            snakeCase: "post_id",
                            screamingSnakeCase: "POST_ID",
                        },
                        valueType: TypeReference.named({
                            fernFilepath: convertToFernFilepath("path/to/commons"),
                            name: "PostId",
                        }),
                    },
                ],
            }),
            typeV2: Type.object({
                extends: [],
                properties: [
                    {
                        docs: undefined,
                        name: {
                            wireValue: "postId",
                            originalValue: "postId",
                            camelCase: "postId",
                            pascalCase: "PostId",
                            snakeCase: "post_id",
                            screamingSnakeCase: "POST_ID",
                        },
                        valueType: TypeReference.named({
                            fernFilepath: convertToFernFilepath("path/to/commons"),
                            name: "PostId",
                        }),
                    },
                ],
            }),
        };

        expect(definition).toEqual(expectedDefinition);
    });
});
