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
                AliasPrompt = new AliasToPrompt(),
                AliasOptionalPrompt = new AliasToPrompt(),
                AliasStream = new AliasToStream(),
                AliasOptionalStream = new AliasToStream(),
                Query = "What is the weather today"
            }
        );
    }

}
