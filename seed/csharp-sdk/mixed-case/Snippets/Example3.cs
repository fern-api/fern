using SeedApi;

public partial class Examples
{
    public async Task Example3() {
        var client = new SeedMixedCaseClient(
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
