import { RelativeFilePath } from "@fern-api/fs-utils";
import {
    constructCasingsGenerator,
    constructFernFileContext,
    convertToFernFilepath,
    parseInlineType
} from "@fern-api/ir-generator";
import { ContainerType, serialization as IrSerialization, TypeReference } from "@fern-api/ir-sdk";

describe("parse inline types", () => {
    it("nested containers", async () => {
        const casingsGenerator = constructCasingsGenerator({
            generationLanguage: undefined,
            keywords: undefined,
            smartCasing: false
        });

        const dummyTypeName = "Dummy";
        const dummyFilepath = RelativeFilePath.of("a/b/c");
        const parsedTypeReference = parseInlineType({
            type: "optional<list<" + dummyTypeName + ">>",
            _default: undefined,
            validation: undefined,
            file: constructFernFileContext({
                relativeFilepath: dummyFilepath,
                definitionFile: {},
                casingsGenerator,
                rootApiFile: {
                    name: "api"
                }
            })
        });
        const expectedTypeReference = TypeReference.container(
            ContainerType.optional(
                TypeReference.container(
                    ContainerType.list(
                        TypeReference.named({
                            typeId: "type_a/b/c:Dummy",
                            fernFilepath: convertToFernFilepath({
                                relativeFilepath: dummyFilepath,
                                casingsGenerator
                            }),
                            name: casingsGenerator.generateName(dummyTypeName),
                            default: undefined,
                            inline: undefined
                        })
                    )
                )
            )
        );

        const parsedTypeReferenceJson = await IrSerialization.TypeReference.jsonOrThrow(parsedTypeReference);
        const expectedTypeReferenceJson = await IrSerialization.TypeReference.jsonOrThrow(expectedTypeReference);

        expect(parsedTypeReferenceJson).toEqual(expectedTypeReferenceJson);
    });
});
