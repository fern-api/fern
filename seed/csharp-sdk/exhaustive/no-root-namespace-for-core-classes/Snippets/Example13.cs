using SeedExhaustive;
using SeedExhaustive.Core;
using SeedExhaustive.Types;

public partial class Examples
{
    public async Task Example13() {
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
