using SeedApi;

namespace Usage;

public class Example1
{
    public async Task Do() {
        var client = new SeedApiClient(
            clientOptions: new ClientOptions {
                BaseUrl = "https://api.fern.com"
            }
        );

        await client.Optional.SendoptionalbodyAsync(
            new Dictionary<string, object?>(){
                ["string"] = new Dictionary<string, object>()
                {
                    ["key"] = "value",
                }
                ,
            }
        );
    }

}
