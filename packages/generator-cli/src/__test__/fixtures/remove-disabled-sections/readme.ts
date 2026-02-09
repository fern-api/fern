import { FernGeneratorCli } from "../../../configuration/sdk/index.js";

const CONFIG: FernGeneratorCli.ReadmeConfig = {
    language: FernGeneratorCli.LanguageInfo.typescript({
        publishInfo: {
            packageName: "basic-sdk"
        }
    }),
    disabledFeatures: ["CONTRIBUTING"],
    organization: "basic"
};

export default CONFIG;
