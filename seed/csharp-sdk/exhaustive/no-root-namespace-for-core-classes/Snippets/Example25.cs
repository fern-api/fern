using SeedExhaustive;
using SeedExhaustive.Core;

public partial class Examples
{
    public async Task Example25() {
        var client = new SeedExhaustiveClient(
            token: "<token>",
            clientOptions: new ClientOptions {
                BaseUrl = "https://api.fern.com"
            }
        );

        await client.Endpoints.Object.GetAndReturnMapOfDocumentedUnknownTypeAsync(
            new Dictionary<string, object>(){
                ["string"] = new Dictionary<string, object>()
                {
                    ["key"] = "value",
                }
                ,
            }
        );
    }

}
