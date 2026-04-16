using SeedExhaustive;
using SeedExhaustive.Core;
using SeedExhaustive.Endpoints;

public partial class Examples
{
    public async Task Example35() {
        var client = new SeedExhaustiveClient(
            token: "<token>",
            clientOptions: new ClientOptions {
                BaseUrl = "https://api.fern.com"
            }
        );

        await client.Endpoints.Params.GetWithQueryAsync(
            new GetWithQuery {
                Query = "query",
                Number = 1
            }
        );
    }

}
