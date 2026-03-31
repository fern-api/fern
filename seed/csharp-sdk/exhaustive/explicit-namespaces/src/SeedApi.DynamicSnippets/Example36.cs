using SeedExhaustive;
using SeedExhaustive.Endpoints.Params;

namespace Usage;

public class Example36
{
    public async Task Do() {
        var client = new SeedExhaustiveClient(
            token: "<token>",
            clientOptions: new ClientOptions {
                BaseUrl = "https://api.fern.com"
            }
        );

        await client.Endpoints.Params.ModifyWithInlinePathAsync(
            new ModifyResourceAtInlinedPath {
                Param = "param",
                Body = "string"
            }
        );
    }

}
