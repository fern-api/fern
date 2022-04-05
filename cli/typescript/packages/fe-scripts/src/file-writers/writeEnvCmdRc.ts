import { Result } from "../Result";
import { createLooseJsonFileWriter } from "./utils/createLooseJsonFileWriter";

export const writeEnvCmdRc = createLooseJsonFileWriter({
    relativePath: ".env-cmdrc",
    isForBundlesOnly: true,
    generateJson: () => ({
        development: {},
        production: {},
    }),
    handleExistingFile: (existing) =>
        "development" in existing && "production" in existing ? Result.success() : Result.failure(),
    options: { prettierParser: "json-stringify" },
});
