using SeedExhaustive;
using SeedExhaustive.Core;

public partial class Examples
{
    public async Task Example47() {
        var client = new SeedExhaustiveClient(
            token: "<token>",
            clientOptions: new ClientOptions {
                BaseUrl = "https://api.fern.com"
            }
        );

        await client.Endpoints.Primitive.GetAndReturnLongAsync(
            1000000L
        );
    }

}
