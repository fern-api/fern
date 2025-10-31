using SeedExhaustive;
using SeedExhaustive.Types;

namespace Usage;

public class Example16
{
    public async Task Do() {
        var client = new SeedExhaustiveClient(
            token: "<token>",
            clientOptions: new ClientOptions {
                BaseUrl = "https://api.fern.com"
            }
        );

        await client.Endpoints.Object.GetAndReturnWithRequiredFieldAsync(
            new ObjectWithRequiredField {
                String = "string"
            }
        );
    }

}
