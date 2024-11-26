import { AbsoluteFilePath } from "@fern-api/fs-utils";

export const DYNAMIC_IR_TEST_DEFINITIONS_DIRECTORY = AbsoluteFilePath.of(
    `${__dirname}/../../../../../../packages/cli/generation/ir-generator/src/dynamic-snippets/__test__/test-definitions`
);
