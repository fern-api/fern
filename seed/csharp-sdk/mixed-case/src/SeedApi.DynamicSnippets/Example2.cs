using SeedMixedCase;

namespace Usage;

public class Example2
{
    public async Task Do() {
        var client = new SeedMixedCaseClient(
            clientOptions: new ClientOptions {
                BaseUrl = "https://api.fern.com"
            }
        );

        await client.Service.ListResourcesAsync(
            new ListResourcesRequest {
                PageLimit = 10,
                BeforeDate = DateOnly.Parse("2023-01-01")
            }
        );
    }

}
