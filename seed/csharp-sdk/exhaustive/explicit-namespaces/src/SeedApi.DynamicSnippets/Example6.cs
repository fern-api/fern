using global::System.Threading.Tasks;
using SeedExhaustive;
using SeedExhaustive.Core;
using SeedExhaustive.Types.Object;

namespace Usage;

public class Example6
{
    public async global::System.Threading.Tasks.Task Do() {
        var client = new SeedExhaustiveClient(
            token: "<token>",
            clientOptions: new ClientOptions{
                BaseUrl = "https://api.fern.com"
            }
        );

        await client.Endpoints.Container.GetAndReturnOptionalAsync(
            new ObjectWithRequiredField{
                String = "string"
            }
        );
    }

}
