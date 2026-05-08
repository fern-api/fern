using SeedApi;

public partial class Examples
{
    public async Task Example53() {
        var client = new SeedApiClient(
            token: "<token>",
            clientOptions: new ClientOptions {
                BaseUrl = "https://api.fern.com"
            }
        );

        await client.Endpoints.Object.GetAndReturnNestedWithRequiredFieldAsListAsync(
            new List<TypesNestedObjectWithRequiredField>(){
                new TypesNestedObjectWithRequiredField {
                    String = "string",
                    NestedObject = new TypesObjectWithOptionalField()
                },
            }
        );
    }

}
