using SeedApi;

namespace Usage;

public class Example13
{
    public async Task Do() {
        var client = new SeedApiClient(
            clientOptions: new ClientOptions {
                BaseUrl = "https://api.fern.com"
            }
        );

        await client.Simple.FoowithexamplesAsync(
            new FooRequest {
                Bar = "bar"
            }
        );
    }

}
