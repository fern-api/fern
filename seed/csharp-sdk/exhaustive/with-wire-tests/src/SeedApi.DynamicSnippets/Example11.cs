using SeedExhaustive;
using SeedExhaustive.Types;

namespace Usage;

public class Example11
{
    public async Task Do() {
        var client = new SeedExhaustiveClient(
            token: "<token>",
            clientOptions: new ClientOptions {
                BaseUrl = "https://api.fern.com"
            }
        );

        await client.Endpoints.HttpMethods.TestPostAsync(
            new ObjectWithRequiredField {
                String = "string"
            }
        );
    }

}
