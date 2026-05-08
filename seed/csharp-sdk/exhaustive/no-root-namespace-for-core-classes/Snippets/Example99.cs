using SeedApi;
using SeedApi.Core;

public partial class Examples
{
    public async Task Example99() {
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
