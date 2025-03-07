using global::System.Threading.Tasks;
using SeedExhaustive;
using SeedExhaustive.Core;

namespace Usage;

public class Example35
{
    public async global::System.Threading.Tasks.Task Do() {
        var client = new SeedExhaustiveClient(
            token: "<token>",
            clientOptions: new ClientOptions{
                BaseUrl = "https://api.fern.com"
            }
        );

        await client.Endpoints.Primitive.GetAndReturnDateAsync(
            DateOnly.Parse("2023-01-15")
        );
    }

}
