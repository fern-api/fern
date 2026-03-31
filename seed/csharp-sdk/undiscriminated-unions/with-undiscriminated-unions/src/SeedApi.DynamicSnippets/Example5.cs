using SeedUndiscriminatedUnions;

namespace Usage;

public class Example5
{
    public async Task Do() {
        var client = new SeedUndiscriminatedUnionsClient(
            clientOptions: new ClientOptions {
                BaseUrl = "https://api.fern.com"
            }
        );

        await client.Union.CallAsync(
            new Request {
                Union = new Dictionary<string, object?>(){
                    ["string"] = new Dictionary<string, object>()
                    {
                        ["key"] = "value",
                    }
                    ,
                }

            }
        );
    }

}
