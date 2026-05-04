using SeedUndiscriminatedUnionWithResponseProperty;

public partial class Examples
{
    public async Task Example1() {
        var client = new SeedUndiscriminatedUnionWithResponsePropertyClient(
            clientOptions: new ClientOptions {
                BaseUrl = "https://api.fern.com"
            }
        );

        await client.ListUnionsAsync();
    }

}
