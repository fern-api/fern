import { FernGeneratorCli } from "../../../configuration/sdk";

const CONFIG: FernGeneratorCli.ReadmeConfig = {
    language: FernGeneratorCli.LanguageInfo.go({
        publishInfo: {
            owner: "basic",
            repo: "basic-go",
            version: "0.0.1"
        }
    }),
    organization: "basic"
};

export default CONFIG;
