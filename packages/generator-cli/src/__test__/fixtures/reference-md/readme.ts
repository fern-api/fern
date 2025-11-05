import { FernGeneratorCli } from "../../../configuration/sdk";

const CONFIG: FernGeneratorCli.ReadmeConfig = {
    language: FernGeneratorCli.LanguageInfo.typescript({
        publishInfo: undefined
    }),
    organization: "imdb",
    referenceMarkdownPath: "./reference.md"
};

export default CONFIG;
