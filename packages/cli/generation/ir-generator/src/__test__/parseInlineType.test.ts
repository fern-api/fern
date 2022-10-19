import { ContainerType, TypeReference } from "@fern-fern/ir-model/types";
import { constructCasingsGenerator } from "../casings/CasingsGenerator";
import { constructFernFileContext } from "../FernFileContext";
import { convertToFernFilepath, convertToFernFilepathV2 } from "../utils/convertToFernFilepath";
import { parseInlineType } from "../utils/parseInlineType";

describe("parse inline types", () => {
    it("nested containers", () => {
        const casingsGenerator = constructCasingsGenerator(undefined);

        const dummyTypeName = "Dummy";
        const dummyFilepath = "a/b/c";
        const parsedTypeReference = parseInlineType({
            type: "optional<list<" + dummyTypeName + ">>",
            file: constructFernFileContext({
                relativeFilepath: dummyFilepath,
                serviceFile: {},
                casingsGenerator,
            }),
        });
        const expectedTypeReference = TypeReference.container(
            ContainerType.optional(
                TypeReference.container(
                    ContainerType.list(
                        TypeReference.named({
                            fernFilepath: convertToFernFilepath({ relativeFilepath: dummyFilepath, casingsGenerator }),
                            fernFilepathV2: convertToFernFilepathV2({
                                relativeFilepath: dummyFilepath,
                                casingsGenerator,
                            }),
                            name: dummyTypeName,
                            nameV2: casingsGenerator.generateNameCasingsV1(dummyTypeName),
                            nameV3: casingsGenerator.generateName(dummyTypeName),
                        })
                    )
                )
            )
        );
        expect(parsedTypeReference).toEqual(expectedTypeReference);
    });
});
