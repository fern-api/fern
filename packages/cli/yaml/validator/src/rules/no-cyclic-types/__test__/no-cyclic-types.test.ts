import { AbsoluteFilePath, join, RelativeFilePath } from "@fern-api/fs-utils";
import { getViolationsForRule } from "../../../testing-utils/getViolationsForRule";
import { NoCyclicTypesRule } from "../no-cyclic-types";

describe("no-cyclic-types", () => {
    it("simple", async () => {
        const violations = await getViolationsForRule({
            rule: NoCyclicTypesRule,
            absolutePathToWorkspace: join(
                AbsoluteFilePath.of(__dirname),
                RelativeFilePath.of("fixtures"),
                RelativeFilePath.of("simple")
            )
        });
        expect(violations).toContainEqual({
            message: "Circular type detected: Node -> child -> Node",
            nodePath: ["types", "Node"],
            relativeFilepath: RelativeFilePath.of("simple.yml"),
            severity: "error"
        });
    });

    it("alias", async () => {
        const violations = await getViolationsForRule({
            rule: NoCyclicTypesRule,
            absolutePathToWorkspace: join(
                AbsoluteFilePath.of(__dirname),
                RelativeFilePath.of("fixtures"),
                RelativeFilePath.of("alias")
            )
        });
        expect(violations).toContainEqual({
            message: "Circular type detected: AlsoNode -> child -> AlsoNode",
            nodePath: ["types", "AlsoNode"],
            relativeFilepath: "alias.yml",
            severity: "error"
        });
    });

    it("multipleTypes", async () => {
        const violations = await getViolationsForRule({
            rule: NoCyclicTypesRule,
            absolutePathToWorkspace: join(
                AbsoluteFilePath.of(__dirname),
                RelativeFilePath.of("fixtures"),
                RelativeFilePath.of("multipleTypes")
            )
        });
        expect(violations).toContainEqual({
            message: "Circular type detected: Node -> child -> AlsoNode -> child -> Node",
            nodePath: ["types", "Node"],
            relativeFilepath: RelativeFilePath.of("multitype.yml"),
            severity: "error"
        });
        expect(violations).toContainEqual({
            message: "Circular type detected: AlsoNode -> child -> Node -> child -> AlsoNode",
            nodePath: ["types", "AlsoNode"],
            relativeFilepath: RelativeFilePath.of("multitype.yml"),
            severity: "error"
        });
    });

    it("union", async () => {
        const violations = await getViolationsForRule({
            rule: NoCyclicTypesRule,
            absolutePathToWorkspace: join(
                AbsoluteFilePath.of(__dirname),
                RelativeFilePath.of("fixtures"),
                RelativeFilePath.of("union")
            )
        });
        expect(violations).toContainEqual({
            message: "Circular type detected: Animal -> union -> AlsoAnimal -> child -> Animal",
            nodePath: ["types", "Animal"],
            relativeFilepath: "discriminated.yml",
            severity: "error"
        });
        expect(violations).toContainEqual({
            message: "Circular type detected: AlsoAnimal -> union -> AlsoAnimal",
            nodePath: ["types", "AlsoAnimal"],
            relativeFilepath: "tree.yml",
            severity: "error"
        });
        expect(violations).toContainEqual({
            message: "Circular type detected: Animal -> union -> Animal",
            nodePath: ["types", "Animal"],
            relativeFilepath: "undiscriminated.yml",
            severity: "error"
        });
    });

    it("valid", async () => {
        const violations = await getViolationsForRule({
            rule: NoCyclicTypesRule,
            absolutePathToWorkspace: join(
                AbsoluteFilePath.of(__dirname),
                RelativeFilePath.of("fixtures"),
                RelativeFilePath.of("valid")
            )
        });
        expect(violations).toEqual([]);
    });
});
