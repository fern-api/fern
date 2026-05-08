using SeedApi;

public partial class Examples
{
    public async Task Example55() {
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
