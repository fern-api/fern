using SeedExhaustive;
using SeedExhaustive.Types.Object;

namespace Usage;

public class Example22
{
    public async Task Do() {
        var client = new SeedExhaustiveClient(
            token: "<token>",
            clientOptions: new ClientOptions {
                BaseUrl = "https://api.fern.com"
            }
        );

        await client.Endpoints.Object.GetAndReturnWithUnknownFieldAsync(
            new ObjectWithUnknownField {
                Unknown = new Dictionary<string, object>()
                {
                    ["$ref"] = "https://example.com/schema",
                }

            }
        );
    }

}
