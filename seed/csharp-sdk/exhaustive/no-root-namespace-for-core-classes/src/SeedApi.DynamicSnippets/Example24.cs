using SeedApi;
using SeedApi.Core;
using OneOf;

namespace Usage;

public class Example24
{
    public async Task Do() {
        var client = new SeedApiClient(
            token: "<token>",
            clientOptions: new ClientOptions {
                BaseUrl = "https://api.fern.com"
            }
        );

        await client.Endpoints.Container.GetAndReturnMapOfPrimToUndiscriminatedUnionAsync(
            new Dictionary<string, OneOf<double, bool, string, IEnumerable<string>>>(){
                ["string"] = 1.1,
            }
        );
    }

}
