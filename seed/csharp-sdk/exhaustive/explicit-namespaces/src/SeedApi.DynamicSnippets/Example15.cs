using global::System.Threading.Tasks;
using SeedExhaustive;
using SeedExhaustive.Types.Object;

namespace Usage;

public class Example15
{
    public async global::System.Threading.Tasks.Task Do() {
        var client = new SeedExhaustiveClient(
            token: "<token>",
            clientOptions: new ClientOptions{
                BaseUrl = "https://api.fern.com"
            }
        );

        await client.Endpoints.Object.GetAndReturnWithOptionalFieldAsync(
            new ObjectWithOptionalField{
                String = "test",
                Integer = 21991583578,
                Long = 9223372036854776000l,
                Double = 3.14,
                Bool = true
            }
        );
    }

}
