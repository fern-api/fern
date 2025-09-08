using global::System.Threading.Tasks;
using SeedExhaustive;
using SeedExhaustive.Core;

namespace Usage;

public class Example36
{
    public async global::System.Threading.Tasks.Task Do() {
        var client = new SeedExhaustiveClient(
            token: "<token>",
            clientOptions: new ClientOptions{
                BaseUrl = "https://api.fern.com"
            }
        );

        await client.Endpoints.Primitive.GetAndReturnUuidAsync(
            "d5e9c84f-c2b2-4bf4-b4b0-7ffd7a9ffc32"
        );
    }

}
