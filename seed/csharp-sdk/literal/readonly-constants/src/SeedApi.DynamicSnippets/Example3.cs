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
                Query = "query",
                Temperature = 1.1,
                AliasedContext = new SomeAliasedLiteral(),
                MaybeContext = new SomeAliasedLiteral(),
                ObjectWithLiteral = new ATopLevelLiteral {
                    NestedLiteral = new ANestedLiteral()
                }
            }
        );
    }

}
