using SeedResponseProperty;

namespace Usage;

public class Example4
{
    public async Task Do() {
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
