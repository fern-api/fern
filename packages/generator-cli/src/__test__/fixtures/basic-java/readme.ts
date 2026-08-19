import { FernGeneratorCli } from "../../../configuration/sdk/index.js";

const CONFIG: FernGeneratorCli.ReadmeConfig = {
    language: FernGeneratorCli.LanguageInfo.java({
        publishInfo: {
            group: "io.intercom",
            artifact: "intercom-java",
            version: "3.0.0"
        }
    }),
    organization: "basic"
};

export default CONFIG;
