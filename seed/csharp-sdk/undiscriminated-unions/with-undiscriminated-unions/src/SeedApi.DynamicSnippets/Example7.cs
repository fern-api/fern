using SeedApi;

namespace Usage;

public class Example7
{
    public async Task Do() {
        var client = new SeedApiClient(
            clientOptions: new ClientOptions {
                BaseUrl = "https://api.fern.com"
            }
        );

        await client.Union.CallAsync(
            new Request {
                Union = new Dictionary<string, object?>(){
                    ["union"] = new Dictionary<string, object>()
                    {
                        ["key"] = "value",
                    }
                    ,
                }

            }
        );
    }

}
