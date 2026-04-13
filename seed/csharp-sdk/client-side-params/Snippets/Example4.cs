using SeedApi;

public partial class Examples
{
    public async Task Example4() {
        var client = new SeedClientSideParamsClient(
            token: "<token>",
            clientOptions: new ClientOptions {
                BaseUrl = "https://api.fern.com"
            }
        );

        await client.Service.SearchresourcesAsync(
            new ServiceSearchResourcesRequest {
                Limit = 1,
                Offset = 1
            }
        );
    }

}
