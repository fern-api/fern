using SeedApi;
using SeedApi.Endpoints.Params;

namespace Usage;

public class Example70
{
    public async Task Do() {
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
