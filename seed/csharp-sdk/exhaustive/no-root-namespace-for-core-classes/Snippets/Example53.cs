using SeedExhaustive;
using SeedExhaustive.Core;

public partial class Examples
{
    public async Task Example53() {
        var client = new SeedExhaustiveClient(
            token: "<token>",
            clientOptions: new ClientOptions {
                BaseUrl = "https://api.fern.com"
            }
        );

        await client.Endpoints.Primitive.GetAndReturnBase64Async(
            "SGVsbG8gd29ybGQh"
        );
    }

}
