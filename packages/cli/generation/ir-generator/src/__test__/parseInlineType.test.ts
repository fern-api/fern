import { ContainerType, TypeReference } from "@fern-fern/ir-model/types";
import { constructFernFileContext } from "../FernFileContext";
import { convertToFernFilepath } from "../utils/convertToFernFilepath";
import { generateStringWithAllCasings } from "../utils/generateCasings";
import { parseInlineType } from "../utils/parseInlineType";

describe("parse inline types", () => {
    it("nested containers", () => {
        const dummyTypeName = "Dummy";
        const dummyFilepath = "a/b/c";
        const parsedTypeReference = parseInlineType({
            type: "optional<list<" + dummyTypeName + ">>",
            file: constructFernFileContext({
                relativeFilepath: dummyFilepath,
                serviceFile: {},
            }),
        });
        const expectedTypeReference = TypeReference.container(
            ContainerType.optional(
                TypeReference.container(
                    ContainerType.list(
                        TypeReference.named({
                            fernFilepath: convertToFernFilepath(dummyFilepath),
                            name: dummyTypeName,
                            nameV2: generateStringWithAllCasings(dummyTypeName),
                        })
                    )
                )
            )
        );
        expect(parsedTypeReference).toEqual(expectedTypeReference);
    });
});
