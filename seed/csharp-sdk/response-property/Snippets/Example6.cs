using SeedResponseProperty;

public partial class Examples
{
    public async Task Example6() {
        var client = new SeedResponsePropertyClient(
            clientOptions: new ClientOptions {
                BaseUrl = "https://api.fern.com"
            }
        );

        await client.Service.GetOptionalMovieNameAsync(
            "string"
        );
    }

}
