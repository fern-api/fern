using SeedExhaustive;
using SeedExhaustive.Types.Union;

namespace Usage;

public class Example39
{
    public async Task Do() {
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
