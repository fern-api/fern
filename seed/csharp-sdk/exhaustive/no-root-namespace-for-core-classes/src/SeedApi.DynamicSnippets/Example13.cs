using SeedApi;
using SeedApi.Core;
using OneOf;

namespace Usage;

public class Example13
{
    public async Task Do() {
        var client = new SeedApiClient(
            token: "<token>",
            clientOptions: new ClientOptions {
                BaseUrl = "https://api.fern.com"
            }
        );

        await client.EndpointsContainer.EndpointsContainerGetAndReturnMapOfPrimToUndiscriminatedUnionAsync(
            new Dictionary<string, OneOf<double, bool, string, IEnumerable<string>>>(){
                ["string"] = 1.1,
            }
        );
    }

}
