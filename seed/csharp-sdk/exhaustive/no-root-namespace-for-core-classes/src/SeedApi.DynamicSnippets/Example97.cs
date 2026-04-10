using SeedApi;
using SeedApi.Core;

namespace Usage;

public class Example97
{
    public async Task Do() {
        var client = new SeedApiClient(
            token: "<token>",
            clientOptions: new ClientOptions {
                BaseUrl = "https://api.fern.com"
            }
        );

        await client.EndpointsUnion.EndpointsUnionGetAndReturnUnionAsync(
            new TypesAnimalZero {
                Animal = TypesAnimalZeroAnimal.Dog,
                Name = "name",
                LikesToWoof = true
            }
        );
    }

}
