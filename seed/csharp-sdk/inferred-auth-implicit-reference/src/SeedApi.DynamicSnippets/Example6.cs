using SeedApi;

namespace Usage;

public class Example6
{
    public async Task Do() {
        var client = new SeedApiClient(
            token: "<token>",
            clientOptions: new ClientOptions {
                BaseUrl = "https://api.fern.com"
            }
        );

        await client.NestedApi.NestedApiGetSomethingAsync();
    }

}
