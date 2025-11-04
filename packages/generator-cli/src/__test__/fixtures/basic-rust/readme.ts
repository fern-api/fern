import { FernGeneratorCli } from "../../../configuration/generated";

const CONFIG: FernGeneratorCli.ReadmeConfig = {
    language: FernGeneratorCli.LanguageInfo.rust({
        publishInfo: {
            packageName: "foxglove/foxglove-rust-sdk",
            version: "0.1.0"
        }
    }),
    organization: "basic"
};

export default CONFIG;
