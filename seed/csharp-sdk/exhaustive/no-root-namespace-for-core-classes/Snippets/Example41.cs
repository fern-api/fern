using SeedExhaustive;
using SeedExhaustive.Core;

public partial class Examples
{
    public async Task Example41() {
        var client = new SeedExhaustiveClient(
            token: "<token>",
            clientOptions: new ClientOptions {
                BaseUrl = "https://api.fern.com"
            }
        );

        await client.Endpoints.Primitive.GetAndReturnIntAsync(
            1
        );
    }

}
