import { FernGeneratorCli } from "../../../configuration/sdk";

const CONFIG: FernGeneratorCli.ReadmeConfig = {
    language: FernGeneratorCli.LanguageInfo.swift({
        publishInfo: {
            gitUrl: "https://github.com/fern-api/basic-swift-sdk",
            minVersion: "0.1.0"
        }
    }),
    organization: "basic"
};

export default CONFIG;
