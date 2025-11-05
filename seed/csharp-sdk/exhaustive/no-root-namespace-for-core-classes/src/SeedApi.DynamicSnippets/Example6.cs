using SeedExhaustive;
using SeedExhaustive.Core;
using SeedExhaustive.Types;

namespace Usage;

public class Example6
{
    public async Task Do() {
        var client = new SeedExhaustiveClient(
            token: "<token>",
            clientOptions: new ClientOptions {
                BaseUrl = "https://api.fern.com"
            }
        );

        await client.Endpoints.Container.GetAndReturnOptionalAsync(
            new ObjectWithRequiredField {
                String = "string"
            }
        );
    }

}
