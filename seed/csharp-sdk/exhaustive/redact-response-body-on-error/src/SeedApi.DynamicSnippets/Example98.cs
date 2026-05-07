using SeedApi;

namespace Usage;

public class Example98
{
    public async Task Do() {
        var client = new SeedApiClient(
            token: "<token>",
            clientOptions: new ClientOptions {
                BaseUrl = "https://api.fern.com"
            }
        );

        await client.Endpoints.Union.GetAndReturnUnionAsync(
            new TypesAnimalZero {
                Name = "name",
                LikesToWoof = true,
                Animal = TypesAnimalZeroAnimal.Dog
            }
        );
    }

}
