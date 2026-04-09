using SeedExhaustive;
using SeedExhaustive.Endpoints.Params;

namespace Usage;

public class Example34
{
    public async Task Do() {
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
