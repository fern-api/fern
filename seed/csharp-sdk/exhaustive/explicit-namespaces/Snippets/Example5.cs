using SeedExhaustive;
using SeedExhaustive.Types.Object;

public partial class Examples
{
    public async Task Example5() {
        var client = new SeedExhaustiveClient(
            token: "<token>",
            clientOptions: new ClientOptions {
                BaseUrl = "https://api.fern.com"
            }
        );

        await client.Endpoints.Container.GetAndReturnMapOfPrimToObjectAsync(
            new Dictionary<string, ObjectWithRequiredField>(){
                ["string"] = new ObjectWithRequiredField {
                    String = "string"
                },
            }
        );
    }

}
