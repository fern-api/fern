import { Schema } from "../../../Schema";
import { itSchemaIdentity } from "../../../__test__/utils/itSchema";
import { list } from "../../list";
import { object } from "../../object";
import { string } from "../../primitives";
import { lazy } from "../lazy";

describe("lazy", () => {
    it("doesn't run immediately", () => {
        let wasRun = false;
        lazy(() => {
            wasRun = true;
            return string();
        });
        expect(wasRun).toBe(false);
    });

    itSchemaIdentity(
        lazy(() => object({ foo: string() })),
        { foo: "hello" }
    );

    // eslint-disable-next-line jest/expect-expect
    it("self-referencial schema doesn't compile", () => {
        () => {
            // @ts-expect-error
            const a = lazy(() => object({ foo: a }));
        };
    });

    // eslint-disable-next-line jest/expect-expect
    it("self-referencial compiles with explicit type", () => {
        () => {
            interface TreeNode {
                children: TreeNode[];
            }
            const TreeNode: Schema<TreeNode, TreeNode> = lazy(() => object({ children: list(TreeNode) }));
        };
    });
});
