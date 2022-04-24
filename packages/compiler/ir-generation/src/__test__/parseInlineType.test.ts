import { ContainerType, FernFilepath, TypeReference } from "@fern-api/api";
import { parseInlineType } from "../utils/parseInlineType";

describe("parse inline types", () => {
    it("nested containers", () => {
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
