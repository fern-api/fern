using SeedApi;
using SeedApi.Core;
using SeedApi.Endpoints;

public partial class Examples
{
    public async Task Example64() {
        var client = new SeedApiClient(
            token: "<token>",
            clientOptions: new ClientOptions {
                BaseUrl = "https://api.fern.com"
            }
        );

        await client.Endpoints.Params.GetWithPathAsync(
            new GetWithPathParamsRequest {
                Param = "param"
            }
        );
    }

}
