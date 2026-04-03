using SeedExamples;

public partial class Examples
{
    public static async Task Example20()
    {
        var client = new SeedExamplesClient(
            token: "<token>",
            clientOptions: new ClientOptions {
                BaseUrl = "https://api.fern.com"
            }
        );

        await client.Service.RefreshTokenAsync(
            null
        );
    }

}
