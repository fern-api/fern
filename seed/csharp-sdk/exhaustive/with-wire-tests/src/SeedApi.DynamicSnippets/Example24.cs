using SeedExhaustive;
using SeedExhaustive.Endpoints;

namespace Usage;

public class Example24
{
    public async Task Do() {
        var client = new SeedExhaustiveClient(
            token: "<token>",
            clientOptions: new ClientOptions {
                BaseUrl = "https://api.fern.com"
            }
        );

        await client.Endpoints.Params.GetWithAllowMultipleQueryAsync(
            new GetWithMultipleQuery {
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
