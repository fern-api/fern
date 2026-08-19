using SeedExhaustive;
using SeedExhaustive.Core;
using SeedExhaustive.Types;

public partial class Examples
{
    public async Task Example22() {
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
