using SeedExhaustive;
using SeedExhaustive.Types;

namespace Usage;

public class Example6
{
    public async Task Do() {
        var client = new SeedExhaustiveClient(
            token: "<token>",
            clientOptions: new ClientOptions {
                BaseUrl = "https://api.fern.com"
            }
        );

        await client.Endpoints.Container.GetAndReturnMapOfPrimToUndiscriminatedUnionAsync(
            new Dictionary<string, MixedType>(){
                ["string"] = 1.1,
            }
        );
    }

}
