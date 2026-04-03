using SeedExhaustive;
using SeedExhaustive.Endpoints.Params;

public partial class Examples
{
    public static async Task Example36()
    {
        var client = new SeedExhaustiveClient(
            token: "<token>",
            clientOptions: new ClientOptions {
                BaseUrl = "https://api.fern.com"
            }
        );

        await client.Endpoints.Params.ModifyWithInlinePathAsync(
            new ModifyResourceAtInlinedPath {
                Param = "param",
                Body = "string"
            }
        );
    }

}
