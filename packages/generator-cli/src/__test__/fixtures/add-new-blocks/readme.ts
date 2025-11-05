import { FernGeneratorCli } from "../../../configuration/sdk";

const CONFIG: FernGeneratorCli.ReadmeConfig = {
    language: FernGeneratorCli.LanguageInfo.typescript({
        publishInfo: {
            packageName: "basic"
        }
    }),
    organization: "basic",
    features: [
        {
            id: "non-advanced",
            snippetsAreOptional: true,
            addendum: "This is a non advanced feature"
        },
        {
            id: "advanced",
            snippetsAreOptional: true,
            addendum: "This is an advanced feature",
            advanced: true
        }
    ]
};

export default CONFIG;
