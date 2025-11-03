using SeedExhaustive;
using SeedExhaustive.Types;

namespace Usage;

public class Example17
{
    public async Task Do() {
        var client = new SeedExhaustiveClient(
            token: "<token>",
            clientOptions: new ClientOptions {
                BaseUrl = "https://api.fern.com"
            }
        );

        await client.Endpoints.Object.GetAndReturnWithMapOfMapAsync(
            new ObjectWithMapOfMap {
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
