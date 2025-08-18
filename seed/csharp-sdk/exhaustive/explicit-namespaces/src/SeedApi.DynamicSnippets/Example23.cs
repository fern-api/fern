using global::System.Threading.Tasks;
using SeedExhaustive;
using SeedExhaustive.Types.Object;

namespace Usage;

public class Example23
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
                String = "just-over-boundary",
                Integer = 2147483648,
                Long = 2147483648l,
                Double = 2,
                Bool = false
            }
        );
    }

}
