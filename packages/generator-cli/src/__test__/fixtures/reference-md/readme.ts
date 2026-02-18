import { FernGeneratorCli } from "../../../configuration/sdk/index.js";

const CONFIG: FernGeneratorCli.ReadmeConfig = {
    language: FernGeneratorCli.LanguageInfo.typescript({
        publishInfo: undefined
    }),
    organization: "imdb",
    referenceMarkdownPath: "./reference.md"
};

export default CONFIG;
