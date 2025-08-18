using global::System.Threading.Tasks;
using SeedExhaustive;
using SeedExhaustive.Types.Object;

namespace Usage;

public class Example25
{
    public async global::System.Threading.Tasks.Task Do() {
        var client = new SeedExhaustive.SeedExhaustiveClient(
            token: "<token>",
            clientOptions: new SeedExhaustive.ClientOptions{
                BaseUrl = "https://api.fern.com"
            }
        );

        await client.Endpoints.Object.TestIntegerOverflowEdgeCasesAsync(
            new SeedExhaustive.Types.Object.ObjectWithOptionalField{
                String = "large-positive",
                Integer = 1000000000000,
                Long = 1000000000000l,
                Double = 1000000000000,
                Bool = false
            }
        );
    }

}
