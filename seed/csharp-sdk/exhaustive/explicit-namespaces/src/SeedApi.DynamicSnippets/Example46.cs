using global::System.Threading.Tasks;
using SeedExhaustive;
using SeedExhaustive.Types.Union;

namespace Usage;

public class Example46
{
    public async global::System.Threading.Tasks.Task Do() {
        var client = new SeedExhaustive.SeedExhaustiveClient(
            token: "<token>",
            clientOptions: new SeedExhaustive.ClientOptions{
                BaseUrl = "https://api.fern.com"
            }
        );

        await client.Endpoints.Union.GetAndReturnUnionAsync(
            new SeedExhaustive.Types.Union.Animal(
                new SeedExhaustive.Types.Union.Dog{
                    Name = "name",
                    LikesToWoof = true
                }
            )
        );
    }

}
