using SeedApi;

namespace Usage;

public class Example3
{
    public async Task Do() {
        var client = new SeedApiClient(
            clientOptions: new ClientOptions {
                BaseUrl = "https://api.fern.com"
            }
        );

        await client._.GetAsync(
            new GetRequest {
                Decimal = 1.1,
                Even = 1,
                Name = "name"
            }
        );
    }

}
