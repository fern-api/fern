using SeedResponseProperty;

namespace Usage;

public class Example6
{
    public async Task Do() {
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
