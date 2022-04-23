import { ContainerType, ErrorDefinition, FernFilepath, TypeReference } from "@fern-api/api";
import { convertErrorDefinition } from "../converters/convertErrorDefinition";
import { parseInlineType } from "../utils/parseInlineType";

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
    it("parse inline nested containers", () => {
        const dummyNamedType = "Dummy";
        const dummyFernFilepath = FernFilepath.of("dummy");
        const parsedTypeReference = parseInlineType({
            type: "optional<list<" + dummyNamedType + ">>",
            fernFilepath: dummyFernFilepath,
            imports: {},
        });
        const expectedTypeReference = TypeReference.container(
            ContainerType.optional(
                TypeReference.container(
                    ContainerType.list(
                        TypeReference.named({
                            fernFilepath: dummyFernFilepath,
                            name: dummyNamedType,
                        })
                    )
                )
            )
        );
        expect(parsedTypeReference).toEqual(expectedTypeReference);
    });
});
