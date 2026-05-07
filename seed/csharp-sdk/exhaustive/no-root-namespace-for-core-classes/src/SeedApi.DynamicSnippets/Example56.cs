using SeedApi;
using SeedApi.Core;

namespace Usage;

public class Example56
{
    public async Task Do() {
        var client = new SeedApiClient(
            token: "<token>",
            clientOptions: new ClientOptions {
                BaseUrl = "https://api.fern.com"
            }
        );

        await client.Endpoints.Object.GetAndReturnWithDocumentedUnknownTypeAsync(
            new TypesObjectWithDocumentedUnknownType {
                DocumentedUnknownType = new Dictionary<string, object>()
                {
                    ["key"] = "value",
                }

            }
        );
    }

}
