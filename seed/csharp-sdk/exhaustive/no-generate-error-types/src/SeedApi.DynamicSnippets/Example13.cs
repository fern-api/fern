using SeedExhaustive;
using SeedExhaustive.Types;

namespace Usage;

public class Example13
{
    public async Task Do() {
        var client = new SeedExhaustiveClient(
            token: "<token>",
            clientOptions: new ClientOptions {
                BaseUrl = "https://api.fern.com"
            }
        );

        await client.Endpoints.HttpMethods.TestPutAsync(
            "id",
            new ObjectWithRequiredField {
                String = "string"
            }
        );
    }

}
