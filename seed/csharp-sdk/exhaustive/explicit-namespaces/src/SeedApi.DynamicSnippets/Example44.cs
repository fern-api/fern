using global::System.Threading.Tasks;
using SeedExhaustive;

namespace Usage;

public class Example44
{
    public async global::System.Threading.Tasks.Task Do() {
        var client = new SeedExhaustive.SeedExhaustiveClient(
            token: "<token>",
            clientOptions: new SeedExhaustive.ClientOptions{
                BaseUrl = "https://api.fern.com"
            }
        );

        await client.Endpoints.Primitive.GetAndReturnBase64Async(
            "SGVsbG8gd29ybGQh"
        );
    }

}
