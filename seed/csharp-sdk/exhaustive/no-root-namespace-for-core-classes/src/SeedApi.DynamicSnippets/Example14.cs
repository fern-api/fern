using SeedExhaustive;
using SeedExhaustive.Core;

namespace Usage;

public class Example14
{
    public async Task Do() {
        var client = new SeedExhaustiveClient(
            token: "<token>",
            clientOptions: new ClientOptions {
                BaseUrl = "https://api.fern.com"
            }
        );

        await client.Endpoints.HttpMethods.TestDeleteAsync(
            "id"
        );
    }

}
