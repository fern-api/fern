using SeedLiteral;

namespace Usage;

public class Example3
{
    public async Task Do() {
        var client = new SeedLiteralClient(
            clientOptions: new ClientOptions {
                BaseUrl = "https://api.fern.com"
            }
        );

        await client.Inlined.SendAsync(
            new SendLiteralsInlinedRequest {
                Prompt = "You are a helpful assistant",
                Context = "You're super wise",
                Query = "query",
                Temperature = 1.1,
                Stream = false,
                AliasedContext = "You're super wise",
                MaybeContext = "You're super wise",
                ObjectWithLiteral = new ATopLevelLiteral {
                    NestedLiteral = new ANestedLiteral {
                        MyLiteral = "How super cool"
                    }
                }
            }
        );
    }

}
