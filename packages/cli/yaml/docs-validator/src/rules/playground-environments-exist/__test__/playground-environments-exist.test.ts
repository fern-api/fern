import { AbsoluteFilePath, RelativeFilePath, join } from "@fern-api/fs-utils";

import { getViolationsForRule } from "../../../testing-utils/getViolationsForRule";
import { PlaygroundEnvironmentsExistRule } from "../playground-environments-exist";

describe("playground-environments-exist", () => {
    it("no environments in api definition", async () => {
        const violations = await getViolationsForRule({
            rule: PlaygroundEnvironmentsExistRule,
            absolutePathToFernDirectory: join(
                AbsoluteFilePath.of(__dirname),
                RelativeFilePath.of("fixtures"),
                RelativeFilePath.of("no-environments-in-api"),
                RelativeFilePath.of("fern")
            )
        });

        expect(violations).toMatchSnapshot();
    });

    it("non existent environment specified", async () => {
        const violations = await getViolationsForRule({
            rule: PlaygroundEnvironmentsExistRule,
            absolutePathToFernDirectory: join(
                AbsoluteFilePath.of(__dirname),
                RelativeFilePath.of("fixtures"),
                RelativeFilePath.of("wrong-environments-in-docs"),
                RelativeFilePath.of("fern")
            )
        });

        expect(violations).toMatchSnapshot();
    });
});
