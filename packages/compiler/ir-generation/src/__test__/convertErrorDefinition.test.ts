import { ErrorDefinition, FernFilepath, TypeReference } from "@fern-api/api";
import { convertErrorDefinition } from "../converters/convertErrorDefinition";

describe("convertErrorDefinition", () => {
    it("reference to a type in another file", () => {
        const definition = convertErrorDefinition({
            errorName: "UnauthorizedError",
            errorDefinition: {
                properties: {
                    postId: "commons.PostId",
                },
            },
            fernFilepath: FernFilepath.of("path/to/service"),
            imports: {
                commons: "./commons",
            },
        });

        const expectedDefinition: ErrorDefinition = {
            docs: undefined,
            name: {
                name: "UnauthorizedError",
                fernFilepath: FernFilepath.of("path/to/service"),
            },
            http: undefined,
            properties: [
                {
                    docs: undefined,
                    name: "postId",
                    type: TypeReference.named({
                        fernFilepath: FernFilepath.of("path/to/commons"),
                        name: "PostId",
                    }),
                },
            ],
        };

        expect(definition).toEqual(expectedDefinition);
    });
});
