import path from "path";
import { AbsoluteFilePath } from "@fern-api/fs-utils";

export const TEST_DEFINITIONS_DIRECTORY = AbsoluteFilePath.of(
    path.join(__dirname, "../../../../../packages/cli/dynamic-snippets/src/__test__/test-definitions")
);
