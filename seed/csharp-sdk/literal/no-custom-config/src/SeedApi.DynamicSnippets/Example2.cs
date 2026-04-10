using SeedApi;

namespace Usage;

public class Example2
{
    public async Task Do() {
        var client = new SeedApiClient(
            clientOptions: new ClientOptions {
                BaseUrl = "https://api.fern.com"
            }
        );

        await client.Inlined.SendAsync(
            new InlinedSendRequest {
                Prompt = InlinedSendRequestPrompt.YouAreAHelpfulAssistant,
                Query = "query",
                Stream = true,
                AliasedContext = SomeAliasedLiteral.YoureSuperWise,
                ObjectWithLiteral = new ATopLevelLiteral {
                    NestedLiteral = new ANestedLiteral {
                        MyLiteral = ANestedLiteralMyLiteral.HowSuperCool
                    }
                }
            }
        );
    }

}
