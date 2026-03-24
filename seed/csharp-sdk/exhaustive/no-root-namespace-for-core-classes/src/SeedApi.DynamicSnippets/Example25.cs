using SeedExhaustive;
using SeedExhaustive.Core;

namespace Usage;

public class Example25
{
    public async Task Do() {
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
