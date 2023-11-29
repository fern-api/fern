import { RelativeFilePath } from "@fern-api/fs-utils";
import { ContainerType, TypeReference } from "@fern-fern/ir-sdk/api";
import * as IrSerialization from "@fern-fern/ir-sdk/serialization";
import { constructCasingsGenerator } from "../casings/CasingsGenerator";
import { constructFernFileContext } from "../FernFileContext";
import { parseInlineType } from "../utils/parseInlineType";

describe("parse inline types", () => {
    it("nested containers", async () => {
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
                    name: "api"
                }
            })
        });
        const expectedTypeReference = TypeReference.container(
            ContainerType.optional(TypeReference.container(ContainerType.list(TypeReference.named("type_a/b/c:Dummy"))))
        );

        const parsedTypeReferenceJson = await IrSerialization.TypeReference.jsonOrThrow(parsedTypeReference);
        const expectedTypeReferenceJson = await IrSerialization.TypeReference.jsonOrThrow(expectedTypeReference);

        expect(parsedTypeReferenceJson).toEqual(expectedTypeReferenceJson);
    });
});
