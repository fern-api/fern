using SeedExhaustive;
using SeedExhaustive.Endpoints.Params;

public partial class Examples
{
    public async Task Example37() {
        var client = new SeedExhaustiveClient(
            token: "<token>",
            clientOptions: new ClientOptions {
                BaseUrl = "https://api.fern.com"
            }
        );

        await client.Endpoints.Params.GetWithPathAndQueryAsync(
            "param",
            new GetWithPathAndQuery {
                Query = "query"
            }
        );
    }

}
