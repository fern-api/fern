using SeedExamples;

public partial class Examples
{
    public static async Task Example22()
    {
        var client = new SeedExamplesClient(
            token: "<token>",
            clientOptions: new ClientOptions {
                BaseUrl = "https://api.fern.com"
            }
        );

        await client.Service.RefreshTokenAsync(
            new RefreshTokenRequest {
                Ttl = 1
            }
        );
    }

}
