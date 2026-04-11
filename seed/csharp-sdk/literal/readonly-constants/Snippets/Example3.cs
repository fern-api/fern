using SeedLiteral;

public partial class Examples
{
    public async Task Example3() {
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
