using SeedApi;

namespace Usage;

public class Example58
{
    public async Task Do() {
        var client = new SeedApiClient(
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
