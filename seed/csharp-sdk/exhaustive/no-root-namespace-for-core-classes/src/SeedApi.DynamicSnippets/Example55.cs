using SeedApi;
using SeedApi.Core;

namespace Usage;

public class Example55
{
    public async Task Do() {
        var client = new SeedApiClient(
            token: "<token>",
            clientOptions: new ClientOptions {
                BaseUrl = "https://api.fern.com"
            }
        );

        await client.Endpoints.Object.GetAndReturnWithUnknownFieldAsync(
            new TypesObjectWithUnknownField {
                Unknown = new Dictionary<string, object>()
                {
                    ["key"] = "value",
                }

            }
        );
    }

}
