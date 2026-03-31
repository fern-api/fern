import { FernGeneratorCli } from "../../../configuration/sdk/index.js";

const CONFIG: FernGeneratorCli.ReadmeConfig = {
    language: FernGeneratorCli.LanguageInfo.typescript({
        publishInfo: {
            packageName: "basic"
        }
    }),
    organization: "basic",
    features: [
        {
            id: FernGeneratorCli.StructuredFeatureId.Usage,
            snippetsAreOptional: true,
            snippets: [
                `import { BasicClient } from "basic";

const client = new BasicClient({ apiKey: "YOUR_API_KEY" });`
            ]
        }
    ]
};

export default CONFIG;
