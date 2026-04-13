using SeedExhaustive;
using SeedExhaustive.Core;
using SeedExhaustive.Types;

public partial class Examples
{
    public async Task Example12() {
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
