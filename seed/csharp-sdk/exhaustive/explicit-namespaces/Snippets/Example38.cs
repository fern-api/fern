using SeedExhaustive;
using SeedExhaustive.Endpoints.Params;

public partial class Examples
{
    public async Task Example38() {
        var client = new SeedExhaustiveClient(
            token: "<token>",
            clientOptions: new ClientOptions {
                BaseUrl = "https://api.fern.com"
            }
        );

        await client.Endpoints.Params.GetWithInlinePathAndQueryAsync(
            new GetWithInlinePathAndQuery {
                Param = "param",
                Query = "query"
            }
        );
    }

}
