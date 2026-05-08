using SeedApi;
using SeedApi.Endpoints;

public partial class Examples
{
    public async Task Example69() {
        var client = new SeedApiClient(
            token: "<token>",
            clientOptions: new ClientOptions {
                BaseUrl = "https://api.fern.com"
            }
        );

        await client.Endpoints.Params.ModifyWithInlinePathAsync(
            new ModifyWithInlinePathParamsRequest {
                Param = "param",
                Body = "string"
            }
        );
    }

}
