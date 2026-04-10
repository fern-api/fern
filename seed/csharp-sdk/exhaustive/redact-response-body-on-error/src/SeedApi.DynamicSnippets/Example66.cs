using SeedApi;

namespace Usage;

public class Example66
{
    public async Task Do() {
        var client = new SeedApiClient(
            token: "<token>",
            clientOptions: new ClientOptions {
                BaseUrl = "https://api.fern.com"
            }
        );

        await client.EndpointsParams.EndpointsParamsGetWithAllowMultipleQueryAsync(
            new EndpointsParamsGetWithAllowMultipleQueryRequest {
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
