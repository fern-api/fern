using global::System.Threading.Tasks;
using SeedExhaustive;
using SeedExhaustive.Types.Object;

namespace Usage;

public class Example22
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
                String = "boundary-test",
                Integer = 2147483647,
                Long = 9223372036854776000l,
                Double = 1.7976931348623157e+308,
                Bool = true
            }
        );
    }

}
