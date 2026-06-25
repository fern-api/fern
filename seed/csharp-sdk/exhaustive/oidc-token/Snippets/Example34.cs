using SeedExhaustive;
using SeedExhaustive.Endpoints;

public partial class Examples
{
    public async Task Example34() {
        var client = new SeedExhaustiveClient(
            token: "<token>",
            clientOptions: new ClientOptions {
                BaseUrl = "https://api.fern.com"
            }
        );

        await client.Endpoints.Params.GetWithInlinePathAsync(
            new GetWithInlinePath {
                Param = "param"
            }
        );
    }

}
