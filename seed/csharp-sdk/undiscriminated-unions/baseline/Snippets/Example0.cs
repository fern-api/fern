using SeedUndiscriminatedUnions;

public partial class Examples
{
    public async Task Example0() {
        var client = new SeedUndiscriminatedUnionsClient(
            clientOptions: new ClientOptions {
                BaseUrl = "https://api.fern.com"
            }
        );

        await client.Union.GetAsync(
            "string"
        );
    }

}
