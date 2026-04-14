using SeedExhaustive;
using SeedExhaustive.Endpoints.Params;

public partial class Examples
{
    public async Task Example36() {
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
