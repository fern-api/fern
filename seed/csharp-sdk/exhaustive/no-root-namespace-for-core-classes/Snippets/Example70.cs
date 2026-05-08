using SeedApi;
using SeedApi.Core;
using SeedApi.Endpoints;

public partial class Examples
{
    public async Task Example70() {
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
