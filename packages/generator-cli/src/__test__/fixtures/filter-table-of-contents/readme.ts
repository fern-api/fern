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
            id: FernGeneratorCli.StructuredFeatureId.Usage,
            snippets: [
                `import { BasicClient } from "basic";

const client = new BasicClient({ apiKey: "YOUR_API_KEY" });`
            ]
        }
    ]
};

export default CONFIG;
