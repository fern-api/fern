using global::System.Threading.Tasks;
using SeedExhaustive;
using SeedExhaustive.Types.Object;

namespace Usage;

public class Example21
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
                String = "boundary-test",
                Integer = 2147483647,
                Double = 1.7976931348623157e+308,
                Bool = true
            }
        );
    }

}
