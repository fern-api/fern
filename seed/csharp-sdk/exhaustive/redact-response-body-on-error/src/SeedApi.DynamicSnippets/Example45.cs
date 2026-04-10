using SeedApi;

namespace Usage;

public class Example45
{
    public async Task Do() {
        var client = new SeedApiClient(
            token: "<token>",
            clientOptions: new ClientOptions {
                BaseUrl = "https://api.fern.com"
            }
        );

        await client.EndpointsObject.EndpointsObjectGetAndReturnWithDocumentedUnknownTypeAsync(
            new TypesObjectWithDocumentedUnknownType {
                DocumentedUnknownType = new Dictionary<string, object>()
                {
                    ["key"] = "value",
                }

            }
        );
    }

}
