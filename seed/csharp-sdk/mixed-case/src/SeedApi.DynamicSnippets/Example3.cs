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

        await client.Service.ListresourcesAsync(
            new ServiceListResourcesRequest {
                PageLimit = 1,
                BeforeDate = DateOnly.Parse("2023-01-15")
            }
        );
    }

}
