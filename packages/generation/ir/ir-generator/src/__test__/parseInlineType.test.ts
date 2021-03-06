import { ContainerType, TypeReference } from "@fern-fern/ir-model";
import { parseInlineType } from "../utils/parseInlineType";

describe("parse inline types", () => {
    it("nested containers", () => {
        const dummyTypeName = "Dummy";
        const dummyFernFilepath: string[] = [];
        const parsedTypeReference = parseInlineType({
            type: "optional<list<" + dummyTypeName + ">>",
            fernFilepath: dummyFernFilepath,
            imports: {},
        });
        const expectedTypeReference = TypeReference.container(
            ContainerType.optional(
                TypeReference.container(
                    ContainerType.list(
                        TypeReference.named({
                            fernFilepath: dummyFernFilepath,
                            name: dummyTypeName,
                        })
                    )
                )
            )
        );
        expect(parsedTypeReference).toEqual(expectedTypeReference);
    });
});
