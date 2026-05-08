using SeedApi;

public partial class Examples
{
    public async Task Example18() {
        var client = new SeedApiClient(
            token: "<token>",
            clientOptions: new ClientOptions {
                BaseUrl = "https://api.fern.com"
            }
        );

        await client.Endpoints.Container.GetAndReturnSetOfObjectsAsync(
            new List<TypesObjectWithRequiredField>(){
                new TypesObjectWithRequiredField {
                    String = "string"
                },
                new TypesObjectWithRequiredField {
                    String = "string"
                },
            }
        );
    }

}
