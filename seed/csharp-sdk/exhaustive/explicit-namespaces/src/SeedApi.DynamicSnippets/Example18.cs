using global::System.Threading.Tasks;
using SeedExhaustive;
using SeedExhaustive.Types.Object;

namespace Usage;

public class Example18
{
    public async global::System.Threading.Tasks.Task Do() {
        var client = new SeedExhaustive.SeedExhaustiveClient(
            token: "<token>",
            clientOptions: new SeedExhaustive.ClientOptions{
                BaseUrl = "https://api.fern.com"
            }
        );

        await client.Endpoints.Object.GetAndReturnWithMapOfMapAsync(
            new SeedExhaustive.Types.Object.ObjectWithMapOfMap{
                Map = new Dictionary<string, Dictionary<string, string>>(){
                    ["map"] = new Dictionary<string, string>(){
                        ["map"] = "map",
                    },
                }
            }
        );
    }

}
