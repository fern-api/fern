using SeedApi;

namespace Usage;

public class Example10
{
    public async Task Do() {
        var client = new SeedApiClient(
            clientOptions: new ClientOptions {
                BaseUrl = "https://api.fern.com"
            }
        );

        await client.Union.NestedunionsAsync(
            "string"
        );
    }

}
