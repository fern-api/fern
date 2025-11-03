using SeedLiteral;

namespace Usage;

public class Example2
{
    public async Task Do() {
        var client = new SeedLiteralClient(
            clientOptions: new ClientOptions {
                BaseUrl = "https://api.fern.com"
            }
        );

        await client.Inlined.SendAsync(
            new SendLiteralsInlinedRequest {
                Temperature = 10.1,
                Prompt = "You are a helpful assistant",
                Context = "You're super wise",
                AliasedContext = "You're super wise",
                MaybeContext = "You're super wise",
                ObjectWithLiteral = new ATopLevelLiteral {
                    NestedLiteral = new ANestedLiteral {
                        MyLiteral = "How super cool"
                    }
                },
                Stream = false,
                Query = "What is the weather today"
            }
        );
    }

}
