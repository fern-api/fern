using SeedExhaustive;

public partial class Examples
{
    public static async Task Example53()
    {
        var client = new SeedExhaustiveClient(
            token: "<token>",
            clientOptions: new ClientOptions {
                BaseUrl = "https://api.fern.com"
            }
        );

        await client.Endpoints.Urls.WithEndingSlashAsync();
    }

}
