import { FernGeneratorCli } from "../../../configuration/sdk";

const CONFIG: FernGeneratorCli.ReadmeConfig = {
    language: FernGeneratorCli.LanguageInfo.typescript({
        publishInfo: {
            packageName: "imdb-typescript-sdk"
        }
    }),
    organization: "imdb",
    disabledFeatures: ["CONTRIBUTING"]
};

export default CONFIG;
