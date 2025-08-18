using global::System.Threading.Tasks;
using SeedExhaustive;
using SeedExhaustive.Types.Object;

namespace Usage;

public class Example25
{
    public async global::System.Threading.Tasks.Task Do() {
        var client = new SeedExhaustiveClient(
            token: "<token>",
            clientOptions: new ClientOptions{
                BaseUrl = "https://api.fern.com"
            }
        );

        await client.Endpoints.Object.TestIntegerOverflowEdgeCasesAsync(
            new ObjectWithOptionalField{
                String = "large-positive",
                Integer = 1000000000000,
                Long = 1000000000000l,
                Double = 1000000000000,
                Bool = false
            }
        );
    }

}
