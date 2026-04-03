using SeedExhaustive;
using SeedExhaustive.Endpoints;

public partial class Examples
{
    public static async Task Example34()
    {
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
