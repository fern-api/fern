using SeedResponseProperty;

public partial class Examples
{
    public async Task Example4() {
        var client = new SeedResponsePropertyClient(
            clientOptions: new ClientOptions {
                BaseUrl = "https://api.fern.com"
            }
        );

        await client.Service.GetOptionalMovieAsync(
            "string"
        );
    }

}
