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
                Prompt = "You are a helpful assistant",
                OptionalPrompt = "You are a helpful assistant",
                AliasPrompt = "You are a helpful assistant",
                AliasOptionalPrompt = "You are a helpful assistant",
                Query = "query",
                Stream = false,
                OptionalStream = false,
                AliasStream = false,
                AliasOptionalStream = false
            }
        );
    }

}
