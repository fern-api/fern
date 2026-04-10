using SeedApi;

namespace Usage;

public class Example8
{
    public async Task Do() {
        var client = new SeedApiClient(
            clientOptions: new ClientOptions {
                BaseUrl = "https://api.fern.com"
            }
        );

        await client.Reference.SendAsync(
            new SendRequest {
                Prompt = SendRequestPrompt.YouAreAHelpfulAssistant,
                Query = "query",
                Stream = true,
                Ending = SendRequestEnding.Ending,
                Context = SomeLiteral.YoureSuperWise,
                ContainerObject = new ContainerObject {
                    NestedObjects = new List<NestedObjectWithLiterals>(){
                        new NestedObjectWithLiterals {
                            Literal1 = NestedObjectWithLiteralsLiteral1.Literal1,
                            Literal2 = NestedObjectWithLiteralsLiteral2.Literal2,
                            StrProp = "strProp"
                        },
                    }

                }
            }
        );
    }

}
