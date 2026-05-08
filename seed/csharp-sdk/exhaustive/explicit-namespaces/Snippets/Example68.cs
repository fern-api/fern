using SeedApi;
using SeedApi.Endpoints.Params;

public partial class Examples
{
    public async Task Example68() {
        var client = new SeedApiClient(
            token: "<token>",
            clientOptions: new ClientOptions {
                BaseUrl = "https://api.fern.com"
            }
        );

        await client.Endpoints.Params.GetWithInlinePathAsync(
            new GetWithInlinePathParamsRequest {
                Param = "param"
            }
        );
    }

}
