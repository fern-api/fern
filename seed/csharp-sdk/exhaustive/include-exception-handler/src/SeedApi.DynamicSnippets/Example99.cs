using SeedApi;

namespace Usage;

public class Example99
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
                Animal = TypesAnimalZeroAnimal.Dog,
                Name = "name",
                LikesToWoof = true
            }
        );
    }

}
