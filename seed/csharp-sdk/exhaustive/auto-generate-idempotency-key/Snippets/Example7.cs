using SeedExhaustive;
using SeedExhaustive.Types;

public partial class Examples
{
    public async Task Example7() {
        var client = new SeedExhaustiveClient(
            token: "<token>",
            clientOptions: new ClientOptions {
                BaseUrl = "https://api.fern.com"
            }
        );

        await client.Endpoints.Container.GetAndReturnMapOfIntegerToObjectAsync(
            new Dictionary<int, ObjectWithRequiredField>(){
                [1] = new ObjectWithRequiredField {
                    String = "string"
                },
            }
        );
    }

}
