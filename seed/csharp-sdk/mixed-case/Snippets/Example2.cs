using SeedMixedCase;

public partial class Examples
{
    public async Task Example2() {
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
