import { RelativeFilePath } from "@fern-api/fs-utils";
import { ContainerType, TypeReference } from "@fern-fern/ir-sdk/api";
import { constructCasingsGenerator } from "../casings/CasingsGenerator";
import { constructFernFileContext } from "../FernFileContext";
import { convertToFernFilepath } from "../utils/convertToFernFilepath";
import { parseInlineType } from "../utils/parseInlineType";

describe("parse inline types", () => {
    it("nested containers", () => {
        const casingsGenerator = constructCasingsGenerator(undefined);

        const dummyTypeName = "Dummy";
        const dummyFilepath = RelativeFilePath.of("a/b/c");
        const parsedTypeReference = parseInlineType({
            type: "optional<list<" + dummyTypeName + ">>",
            file: constructFernFileContext({
                relativeFilepath: dummyFilepath,
                definitionFile: {},
                casingsGenerator,
                rootApiFile: {
                    name: "api",
                },
            }),
        });
        const expectedTypeReference = TypeReference.container(
            ContainerType.optional(
                TypeReference.container(
                    ContainerType.list(
                        TypeReference.named({
                            typeId: "type_a/b/c:Dummy",
                            fernFilepath: convertToFernFilepath({
                                relativeFilepath: dummyFilepath,
                                casingsGenerator,
                            }),
                            name: casingsGenerator.generateName(dummyTypeName),
                        })
                    )
                )
            )
        );
        expect(parsedTypeReference).toEqual(expectedTypeReference);
    });
});
