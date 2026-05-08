using SeedApi;
using SeedApi.Core;

public partial class Examples
{
    public async Task Example100() {
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
