using global::System.Threading.Tasks;
using SeedExhaustive;
using SeedExhaustive.Types.Object;

namespace Usage;

public class Example24
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
                String = "just-under-boundary",
                Integer = -2147483649,
                Long = -2147483649l,
                Double = -2,
                Bool = true
            }
        );
    }

}
