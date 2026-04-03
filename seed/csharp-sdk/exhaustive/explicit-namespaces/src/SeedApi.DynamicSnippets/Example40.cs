using SeedExhaustive;

public partial class Examples
{
    public static async Task Example40()
    {
        var client = new SeedExhaustiveClient(
            token: "<token>",
            clientOptions: new ClientOptions {
                BaseUrl = "https://api.fern.com"
            }
        );

        await client.Endpoints.Primitive.GetAndReturnStringAsync(
            "string"
        );
    }

}
