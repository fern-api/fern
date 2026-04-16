using SeedExhaustive;
using SeedExhaustive.Types.Object;

public partial class Examples
{
    public async Task Example3() {
        var client = new SeedExhaustiveClient(
            token: "<token>",
            clientOptions: new ClientOptions {
                BaseUrl = "https://api.fern.com"
            }
        );

        await client.Endpoints.Container.GetAndReturnSetOfObjectsAsync(
            new HashSet<ObjectWithRequiredField>(){
                new ObjectWithRequiredField {
                    String = "string"
                },
            }
        );
    }

}
