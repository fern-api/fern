import { ErrorDeclaration } from "@fern-fern/ir-model/errors";
import { Type, TypeReference } from "@fern-fern/ir-model/types";
import { convertErrorDeclaration } from "../converters/convertErrorDeclaration";

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
            fernFilepath: ["path", "to"],
            imports: {
                commons: "./commons",
            },
        });

        const expectedDefinition: ErrorDeclaration = {
            docs: undefined,
            name: {
                name: "UnauthorizedError",
                fernFilepath: ["path", "to"],
            },
            http: undefined,
            type: Type.object({
                extends: [],
                properties: [
                    {
                        docs: undefined,
                        key: "postId",
                        valueType: TypeReference.named({
                            fernFilepath: ["path", "to"],
                            name: "PostId",
                        }),
                    },
                ],
            }),
        };

        expect(definition).toEqual(expectedDefinition);
    });
});
