using global::System.Threading.Tasks;
using SeedExhaustive;
using SeedExhaustive.Types.Union;

namespace Usage;

public class Example45
{
    public async global::System.Threading.Tasks.Task Do() {
        var client = new SeedExhaustiveClient(
            token: "<token>",
            clientOptions: new ClientOptions{
                BaseUrl = "https://api.fern.com"
            }
        );

        await client.Endpoints.Union.GetAndReturnUnionAsync(
            new Animal(
                new Dog{
                    Name = "name",
                    LikesToWoof = true
                }
            )
        );
    }

}
