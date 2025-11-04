import { FernGeneratorCli } from "../../../configuration/generated";

const CONFIG: FernGeneratorCli.ReadmeConfig = {
    language: FernGeneratorCli.LanguageInfo.go({
        publishInfo: {
            owner: "cohere-ai",
            repo: "cohere-go",
            version: "2.5.2"
        }
    }),
    organization: "cohere",
    bannerLink:
        "https://raw.githubusercontent.com/cohere-ai/cohere-typescript/5188b11a6e91727fdd4d46f4a690419ad204224d/banner.png",
    apiReferenceLink: "https://docs.cohere.com",
    features: [
        {
            id: "USAGE",
            description: "Instantiate the client with the following:\n",
            snippets: [
                'import (\n\tfern "github.com/custom/fern"\n\tfernclient "github.com/custom/fern/client"\n\toption "github.com/custom/fern/option"\n)\n\nclient := fernclient.NewClient(\n\toption.WithToken(\n\t\t"\u003cYOUR_AUTH_TOKEN\u003e",\n\t),\n)\nresponse, err := client.Chat(\n\tctx,\n\t\u0026fern.ChatRequest{\n\t\tMessage: "Can you give me a global market overview of solar panels?",\n\t},\n)\n'
            ],
            snippetsAreOptional: false
        },
        {
            id: "ERRORS",
            description:
                "Structured error types are returned from API calls that return non-success status codes.\nFor example, you can check if the error was of a particular type with the following:\n",
            snippets: [
                'response, err := client.Chat(\n\tctx,\n\t\u0026fern.ChatRequest{\n\t\tMessage: "Can you give me a global market overview of solar panels?",\n\t},\n)\nif err != nil {\n\tvar apiError *core.APIError\n\tif errors.As(err, &apiError) {\n\t\t// Handle the error.\n\t}\n\treturn nil, err\n}\n'
            ],
            snippetsAreOptional: false
        },
        {
            id: "TIMEOUTS",
            description:
                "Setting a timeout for each individual request is as simple as\nusing the standard `context` library. Setting a one second timeout\nfor an individual API call looks like the following:\n",
            snippets: [
                'ctx, cancel := context.WithTimeout(context.Background(), time.Second)\ndefer cancel()\n\nresponse, err := client.Chat(\n\tctx,\n\t\u0026fern.ChatRequest{\n\t\tMessage: "Can you give me a global market overview of solar panels?",\n\t},\n)\n'
            ],
            snippetsAreOptional: false
        }
    ]
};

export default CONFIG;
