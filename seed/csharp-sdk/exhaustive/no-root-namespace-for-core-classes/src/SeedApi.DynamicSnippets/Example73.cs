using SeedApi;
using SeedApi.Core;
using SeedApi.Endpoints;

namespace Usage;

public class Example73
{
    public async Task Do() {
        var client = new SeedApiClient(
            token: "<token>",
            clientOptions: new ClientOptions {
                BaseUrl = "https://api.fern.com"
            }
        );

        await client.Endpoints.Params.GetWithAllowMultipleQueryAsync(
            new GetWithAllowMultipleQueryParamsRequest {
                Query = new List<string>(){
                    "query",
                }
                ,
                Number = new List<int>(){
                    1,
                }

            }
        );
    }

}
