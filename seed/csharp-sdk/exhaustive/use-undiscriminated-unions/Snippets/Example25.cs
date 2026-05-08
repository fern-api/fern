using SeedApi;

public partial class Examples
{
    public async Task Example25() {
        var client = new SeedApiClient(
            token: "<token>",
            clientOptions: new ClientOptions {
                BaseUrl = "https://api.fern.com"
            }
        );

        await client.Endpoints.Container.GetAndReturnOptionalAsync(
            new TypesObjectWithRequiredField {
                String = "string"
            }
        );
    }

}
