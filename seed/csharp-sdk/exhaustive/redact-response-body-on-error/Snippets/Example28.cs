using SeedExhaustive;
using SeedExhaustive.Types;

public partial class Examples
{
    public async Task Example28() {
        var client = new SeedExhaustiveClient(
            token: "<token>",
            clientOptions: new ClientOptions {
                BaseUrl = "https://api.fern.com"
            }
        );

        await client.Endpoints.Object.GetAndReturnWithRequiredNestedObjectAsync(
            new ObjectWithRequiredNestedObject {
                RequiredString = "hello",
                RequiredObject = new NestedObjectWithRequiredField {
                    String = "nested",
                    NestedObject = new ObjectWithOptionalField()
                }
            }
        );
    }

}
