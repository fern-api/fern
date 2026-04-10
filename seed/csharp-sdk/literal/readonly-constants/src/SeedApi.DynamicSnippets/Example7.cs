using SeedLiteral;

namespace Usage;

public class Example7
{
    public async Task Do() {
        var client = new SeedLiteralClient(
            clientOptions: new ClientOptions {
                BaseUrl = "https://api.fern.com"
            }
        );

        await client.Query.SendAsync(
            new SendLiteralsInQueryRequest {
                AliasPrompt = new AliasToPrompt(),
                AliasOptionalPrompt = new AliasToPrompt(),
                Query = "query",
                AliasStream = new AliasToStream(),
                AliasOptionalStream = new AliasToStream()
            }
        );
    }

}
