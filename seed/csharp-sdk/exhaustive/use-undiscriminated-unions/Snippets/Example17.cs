using SeedExhaustive;
using SeedExhaustive.Types;

public partial class Examples
{
    public async Task Example17() {
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
