using SeedExhaustive;
using SeedExhaustive.Types.Object;

public partial class Examples
{
    public async Task Example1() {
        var client = new SeedExhaustiveClient(
            token: "<token>",
            clientOptions: new ClientOptions {
                BaseUrl = "https://api.fern.com"
            }
        );

        await client.Endpoints.Container.GetAndReturnListOfObjectsAsync(
            new List<ObjectWithRequiredField>(){
                new ObjectWithRequiredField {
                    String = "string"
                },
                new ObjectWithRequiredField {
                    String = "string"
                },
            }
        );
    }

}
