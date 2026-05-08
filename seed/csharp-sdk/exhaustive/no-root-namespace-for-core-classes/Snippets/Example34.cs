using SeedApi;
using SeedApi.Core;
using SeedApi.Endpoints;

public partial class Examples
{
    public async Task Example34() {
        var client = new SeedApiClient(
            token: "<token>",
            clientOptions: new ClientOptions {
                BaseUrl = "https://api.fern.com"
            }
        );

        await client.Endpoints.HttpMethods.TestGetAsync(
            new TestGetHttpMethodsRequest {
                Id = "id"
            }
        );
    }

}
