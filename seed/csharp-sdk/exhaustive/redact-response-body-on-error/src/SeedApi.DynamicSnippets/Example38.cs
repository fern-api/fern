using SeedExhaustive;

public partial class Examples
{
    public static async Task Example38()
    {
        var client = new SeedExhaustiveClient(
            token: "<token>",
            clientOptions: new ClientOptions {
                BaseUrl = "https://api.fern.com"
            }
        );

        await client.Endpoints.Params.GetWithPathAndErrorsAsync(
            "param"
        );
    }

}
