using SeedExhaustive;
using SeedExhaustive.Types.Object;

public partial class Examples
{
    public async Task Example23() {
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
                    ["key"] = "value",
                }

            }
        );
    }

}
