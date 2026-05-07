using SeedApi;

namespace Usage;

public class Example47
{
    public async Task Do() {
        var client = new SeedApiClient(
            token: "<token>",
            clientOptions: new ClientOptions {
                BaseUrl = "https://api.fern.com"
            }
        );

        await client.Endpoints.Object.GetAndReturnWithMapOfMapAsync(
            new TypesObjectWithMapOfMap {
                Map = new Dictionary<string, Dictionary<string, string>>(){
                    ["key"] = new Dictionary<string, string>(){
                        ["key"] = "value",
                    }
                    ,
                }

            }
        );
    }

}
