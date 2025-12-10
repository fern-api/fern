import { FernGeneratorCli } from "../../../configuration/sdk";

const CONFIG: FernGeneratorCli.ReadmeConfig = {
    language: FernGeneratorCli.LanguageInfo.typescript({
        publishInfo: {
            packageName: "@acme/sdk"
        }
    }),
    organization: "acme",
    features: [
        {
            id: FernGeneratorCli.StructuredFeatureId.Usage,
            description: "This example demonstrates intermingling markdown and code snippets.\n",
            snippets: [
                "const client = new AcmeClient({ apiKey: 'YOUR_API_KEY' });",
                {
                    type: "markdown",
                    content: "You can also configure the client with additional options:"
                },
                {
                    type: "code",
                    content:
                        "const client = new AcmeClient({\n  apiKey: 'YOUR_API_KEY',\n  timeout: 30000,\n  retries: 3\n});",
                    language: "typescript"
                },
                {
                    type: "markdown",
                    content: "For Python users, the equivalent code is:"
                },
                {
                    type: "code",
                    content: "client = AcmeClient(\n    api_key='YOUR_API_KEY',\n    timeout=30000,\n    retries=3\n)",
                    language: "python"
                }
            ],
            snippetsAreOptional: false
        },
        {
            id: FernGeneratorCli.StructuredFeatureId.Errors,
            description: "Handle errors gracefully.\n",
            snippets: [
                {
                    type: "code",
                    content:
                        "try {\n  await client.users.get('user-id');\n} catch (error) {\n  if (error instanceof AcmeError) {\n    console.error(error.message);\n  }\n}"
                },
                {
                    type: "markdown",
                    content: "> **Note:** All errors extend the base `AcmeError` class."
                }
            ],
            snippetsAreOptional: false
        }
    ]
};

export default CONFIG;
