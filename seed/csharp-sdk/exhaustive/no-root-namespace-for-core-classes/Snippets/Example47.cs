using SeedApi;
using SeedApi.Core;

public partial class Examples
{
    public async Task Example47() {
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
