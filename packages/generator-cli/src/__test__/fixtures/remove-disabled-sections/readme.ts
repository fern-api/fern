import { FernGeneratorCli } from "../../../configuration/generated";

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
