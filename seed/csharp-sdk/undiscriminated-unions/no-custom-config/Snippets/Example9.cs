using SeedUndiscriminatedUnions;

public partial class Examples
{
    public async Task Example9() {
        var client = new SeedUndiscriminatedUnionsClient(
            clientOptions: new ClientOptions {
                BaseUrl = "https://api.fern.com"
            }
        );

        await client.Union.NestedObjectUnionsAsync(
            "string"
        );
    }

}
