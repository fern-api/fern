using SeedApi;
using SeedApi.Core;
using OneOf;

public partial class Examples
{
    public async Task Example23() {
        var client = new SeedApiClient(
            token: "<token>",
            clientOptions: new ClientOptions {
                BaseUrl = "https://api.fern.com"
            }
        );

        await client.Endpoints.Container.GetAndReturnMapOfPrimToUndiscriminatedUnionAsync(
            new Dictionary<string, OneOf<double, bool, string, IEnumerable<string>>>(){
                ["key"] = 1.1,
            }
        );
    }

}
