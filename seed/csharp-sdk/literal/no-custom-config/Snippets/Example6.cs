using SeedLiteral;

public partial class Examples
{
    public async Task Example6() {
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
                Stream = false,
                OptionalStream = false,
                AliasStream = false,
                AliasOptionalStream = false,
                Query = "What is the weather today"
            }
        );
    }

}
