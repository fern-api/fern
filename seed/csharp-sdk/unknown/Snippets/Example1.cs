using SeedUnknownAsAny;

public partial class Examples
{
    public async Task Example1() {
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
