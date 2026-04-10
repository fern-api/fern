using SeedApi;

namespace Usage;

public class Example3
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
                Context = InlinedSendRequestContext.YoureSuperWise,
                Query = "query",
                Temperature = 1.1,
                Stream = true,
                AliasedContext = SomeAliasedLiteral.YoureSuperWise,
                MaybeContext = SomeAliasedLiteral.YoureSuperWise,
                ObjectWithLiteral = new ATopLevelLiteral {
                    NestedLiteral = new ANestedLiteral {
                        MyLiteral = ANestedLiteralMyLiteral.HowSuperCool
                    }
                }
            }
        );
    }

}
