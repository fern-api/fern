using SeedExhaustive;
using SeedExhaustive.Core;
using SeedExhaustive.Types;

namespace Usage;

public class Example24
{
    public async Task Do() {
        var client = new SeedExhaustiveClient(
            token: "<token>",
            clientOptions: new ClientOptions {
                BaseUrl = "https://api.fern.com"
            }
        );

        await client.Endpoints.Object.GetAndReturnWithDocumentedUnknownTypeAsync(
            new ObjectWithDocumentedUnknownType {
                DocumentedUnknownType = new Dictionary<string, object>()
                {
                    ["key"] = "value",
                }

            }
        );
    }

}
