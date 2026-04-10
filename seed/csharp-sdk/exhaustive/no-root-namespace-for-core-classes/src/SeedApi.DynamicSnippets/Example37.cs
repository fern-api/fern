using SeedApi;
using SeedApi.Core;

namespace Usage;

public class Example37
{
    public async Task Do() {
        var client = new SeedApiClient(
            token: "<token>",
            clientOptions: new ClientOptions {
                BaseUrl = "https://api.fern.com"
            }
        );

        await client.EndpointsObject.EndpointsObjectGetAndReturnWithMapOfMapAsync(
            new TypesObjectWithMapOfMap {
                Map = new Dictionary<string, Dictionary<string, string>>(){
                    ["map"] = new Dictionary<string, string>(){
                        ["map"] = "map",
                    }
                    ,
                }

            }
        );
    }

}
