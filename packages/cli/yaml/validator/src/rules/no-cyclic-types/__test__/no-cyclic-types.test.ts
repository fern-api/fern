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

    it("list", async () => {
        const violations = await getViolationsForRule({
            rule: NoCyclicTypesRule,
            absolutePathToWorkspace: join(
                AbsoluteFilePath.of(__dirname),
                RelativeFilePath.of("fixtures"),
                RelativeFilePath.of("list")
            )
        });
        expect(violations).toContainEqual({
            message: "Circular type detected: Node -> foo -> list<Node> -> items -> Node",
            nodePath: ["types", "Node"],
            relativeFilepath: RelativeFilePath.of("list.yml"),
            severity: "error"
        });
    });

    it("map", async () => {
        const violations = await getViolationsForRule({
            rule: NoCyclicTypesRule,
            absolutePathToWorkspace: join(
                AbsoluteFilePath.of(__dirname),
                RelativeFilePath.of("fixtures"),
                RelativeFilePath.of("map")
            )
        });
        expect(violations).toContainEqual({
            message: "Circular type detected: Node -> foo -> map<Node, string> -> key -> Node",
            nodePath: ["types", "Node"],
            relativeFilepath: "map.yml",
            severity: "error"
        });
        expect(violations).toContainEqual({
            message: "Circular type detected: AlsoNode -> bar -> map<string, AlsoNode> -> value -> AlsoNode",
            nodePath: ["types", "AlsoNode"],
            relativeFilepath: "map.yml",
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
            message: "Circular type detected: Animal -> union -> Animal",
            nodePath: ["types", "Animal"],
            relativeFilepath: RelativeFilePath.of("discriminated.yml"),
            severity: "error"
        });
        expect(violations).toContainEqual({
            message: "Circular type detected: Animal -> union -> Animal",
            nodePath: ["types", "Animal"],
            relativeFilepath: RelativeFilePath.of("undiscriminated.yml"),
            severity: "error"
        });
    });

    it("nested", async () => {
        const violations = await getViolationsForRule({
            rule: NoCyclicTypesRule,
            absolutePathToWorkspace: join(
                AbsoluteFilePath.of(__dirname),
                RelativeFilePath.of("fixtures"),
                RelativeFilePath.of("nested")
            )
        });
        expect(violations).toContainEqual({
            message: "Circular type detected: Animal -> union -> set<Animal> -> items -> Animal",
            nodePath: ["types", "Animal"],
            relativeFilepath: "nested.yml",
            severity: "error"
        });
    });

    it("veryNested", async () => {
        const violations = await getViolationsForRule({
            rule: NoCyclicTypesRule,
            absolutePathToWorkspace: join(
                AbsoluteFilePath.of(__dirname),
                RelativeFilePath.of("fixtures"),
                RelativeFilePath.of("nested")
            )
        });

        expect(violations).toContainEqual({
            message: "Circular type detected: Animal -> union -> set<Animal> -> items -> Animal",
            nodePath: ["types", "Animal"],
            relativeFilepath: "nested.yml",
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
