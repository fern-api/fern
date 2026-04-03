using SeedResponseProperty;

public partial class Examples
{
    public static async Task Example5()
    {
        var client = new SeedResponsePropertyClient(
            clientOptions: new ClientOptions {
                BaseUrl = "https://api.fern.com"
            }
        );

        await client.Service.GetOptionalMovieDocsAsync(
            "string"
        );
    }

}
