using SeedUndiscriminatedUnions;

public partial class Examples
{
    public static async Task Example7()
    {
        var client = new SeedUndiscriminatedUnionsClient(
            clientOptions: new ClientOptions {
                BaseUrl = "https://api.fern.com"
            }
        );

        await client.Union.DuplicateTypesUnionAsync(
            "string"
        );
    }

}
