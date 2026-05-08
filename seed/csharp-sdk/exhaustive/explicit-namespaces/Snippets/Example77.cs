using SeedApi;
using SeedApi.Endpoints.Params;

public partial class Examples
{
    public async Task Example77() {
        var client = new SeedApiClient(
            token: "<token>",
            clientOptions: new ClientOptions {
                BaseUrl = "https://api.fern.com"
            }
        );

        await client.Endpoints.Params.GetWithInlinePathAndQueryAsync(
            new GetWithInlinePathAndQueryParamsRequest {
                Param = "param",
                Query = "query"
            }
        );
    }

}
