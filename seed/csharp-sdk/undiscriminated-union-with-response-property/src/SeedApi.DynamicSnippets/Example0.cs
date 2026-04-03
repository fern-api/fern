using SeedUndiscriminatedUnionWithResponseProperty;

public partial class Examples
{
    public static async Task Example0()
    {
        var client = new SeedUndiscriminatedUnionWithResponsePropertyClient(
            clientOptions: new ClientOptions {
                BaseUrl = "https://api.fern.com"
            }
        );

        await client.GetUnionAsync();
    }

}
