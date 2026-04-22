using SeedExamples;

public partial class Examples
{
    public async Task Example21() {
        var client = new SeedExamplesClient(
            token: "<token>",
            clientOptions: new ClientOptions {
                BaseUrl = "https://api.fern.com"
            }
        );

        await client.Service.RefreshTokenAsync(
            new RefreshTokenRequest {
                Ttl = 420
            }
        );
    }

}
