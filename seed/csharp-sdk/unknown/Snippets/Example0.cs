using SeedUnknownAsAny;

public partial class Examples
{
    public async Task Example0() {
        var client = new SeedUnknownAsAnyClient(
            clientOptions: new ClientOptions {
                BaseUrl = "https://api.fern.com"
            }
        );

        await client.Unknown.PostAsync(
            new Dictionary<string, object>()
            {
                ["key"] = "value",
            }
        );
    }

}
