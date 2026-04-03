using SeedExhaustive;
using SeedExhaustive.Core;

public partial class Examples
{
    public static async Task Example43()
    {
        var client = new SeedExhaustiveClient(
            token: "<token>",
            clientOptions: new ClientOptions {
                BaseUrl = "https://api.fern.com"
            }
        );

        await client.Endpoints.Primitive.GetAndReturnDoubleAsync(
            1.1
        );
    }

}
