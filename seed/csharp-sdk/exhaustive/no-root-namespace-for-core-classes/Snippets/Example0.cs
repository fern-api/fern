using SeedExhaustive;
using SeedExhaustive.Core;

public partial class Examples
{
    public async Task Example0() {
        var client = new SeedExhaustiveClient(
            token: "<token>",
            clientOptions: new ClientOptions {
                BaseUrl = "https://api.fern.com"
            }
        );

        await client.Endpoints.Container.GetAndReturnListOfPrimitivesAsync(
            new List<string>(){
                "string",
                "string",
            }
        );
    }

}
