using SeedUnknownAsAny;

namespace Usage;

public class Example1
{
    public async Task Do() {
        var client = new SeedUnknownAsAnyClient(
            clientOptions: new ClientOptions {
                BaseUrl = "https://api.fern.com"
            }
        );

        await client.Unknown.PostObjectAsync(
            new MyObject {
                Unknown = new Dictionary<string, object>()
                {
                    ["key"] = "value",
                }

            }
        );
    }

}
