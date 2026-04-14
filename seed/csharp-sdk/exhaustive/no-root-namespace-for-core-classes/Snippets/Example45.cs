using SeedExhaustive;
using SeedExhaustive.Core;

public partial class Examples
{
    public async Task Example45() {
        var client = new SeedExhaustiveClient(
            token: "<token>",
            clientOptions: new ClientOptions {
                BaseUrl = "https://api.fern.com"
            }
        );

        await client.Endpoints.Primitive.GetAndReturnStringAsync(
            "string"
        );
    }

}
