import path from "path";
import { AbsoluteFilePath } from "@fern-api/fs-utils";

export const DYNAMIC_IR_TEST_DEFINITIONS_DIRECTORY = AbsoluteFilePath.of(
    path.join(
        __dirname,
        "../../../../../../packages/cli/generation/ir-generator/src/dynamic-snippets/__test__/test-definitions"
    )
);
