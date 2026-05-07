using SeedApi;

namespace Usage;

public class Example23
{
    public async Task Do() {
        var client = new SeedApiClient(
            token: "<token>",
            clientOptions: new ClientOptions {
                BaseUrl = "https://api.fern.com"
            }
        );

        await client.Endpoints.Container.GetAndReturnMapOfPrimToUndiscriminatedUnionAsync(
            new Dictionary<string, TypesMixedType>(){
                ["key"] = 1.1,
            }
        );
    }

}
