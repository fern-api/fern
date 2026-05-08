using SeedApi;
using SeedApi.Core;

public partial class Examples
{
    public async Task Example46() {
        var client = new SeedApiClient(
            token: "<token>",
            clientOptions: new ClientOptions {
                BaseUrl = "https://api.fern.com"
            }
        );

        await client.Endpoints.Object.GetAndReturnWithRequiredFieldAsync(
            new TypesObjectWithRequiredField {
                String = "string"
            }
        );
    }

}
