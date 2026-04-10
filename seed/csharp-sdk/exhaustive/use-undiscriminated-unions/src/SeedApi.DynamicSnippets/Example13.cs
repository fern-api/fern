using SeedApi;

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
            new Dictionary<string, TypesMixedType>(){
                ["string"] = 1.1,
            }
        );
    }

}
