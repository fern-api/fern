using SeedExhaustive;
using SeedExhaustive.Core;
using SeedExhaustive.Types;

public partial class Examples
{
    public async Task Example24() {
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
