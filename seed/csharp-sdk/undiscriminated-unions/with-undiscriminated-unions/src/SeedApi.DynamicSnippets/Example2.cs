using SeedUndiscriminatedUnions;

public partial class Examples
{
    public static async Task Example2()
    {
        var client = new SeedUndiscriminatedUnionsClient(
            clientOptions: new ClientOptions {
                BaseUrl = "https://api.fern.com"
            }
        );

        await client.Union.GetMetadataAsync();
    }

}
