using SeedUnknownAsAny;

namespace Usage;

public class Example0
{
    public async Task Do() {
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
