using SeedExhaustive;
using SeedExhaustive.Types;

public partial class Examples
{
    public async Task Example50() {
        var client = new SeedExhaustiveClient(
            token: "<token>",
            clientOptions: new ClientOptions {
                BaseUrl = "https://api.fern.com"
            }
        );

        await client.Endpoints.Union.GetAndReturnUnionAsync(
            new Animal(
                new Dog {
                    Name = "name",
                    LikesToWoof = true
                }
            )
        );
    }

}
