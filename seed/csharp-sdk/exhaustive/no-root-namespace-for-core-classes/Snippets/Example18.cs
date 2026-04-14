using SeedExhaustive;
using SeedExhaustive.Core;
using SeedExhaustive.Types;

public partial class Examples
{
    public async Task Example18() {
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
