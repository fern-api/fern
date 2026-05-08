using SeedApi;
using SeedApi.Endpoints;

public partial class Examples
{
    public async Task Example72() {
        var client = new SeedApiClient(
            token: "<token>",
            clientOptions: new ClientOptions {
                BaseUrl = "https://api.fern.com"
            }
        );

        await client.Endpoints.Params.GetWithQueryAsync(
            new GetWithQueryParamsRequest {
                Query = "query",
                Number = 1
            }
        );
    }

}
