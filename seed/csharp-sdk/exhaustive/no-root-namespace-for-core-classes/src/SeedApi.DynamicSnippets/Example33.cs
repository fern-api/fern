using SeedExhaustive;
using SeedExhaustive.Core;

namespace Usage;

public class Example33
{
    public async Task Do() {
        var client = new SeedExhaustiveClient(
            token: "<token>",
            clientOptions: new ClientOptions {
                BaseUrl = "https://api.fern.com"
            }
        );

        await client.Endpoints.Primitive.GetAndReturnBoolAsync(
            true
        );
    }

}
