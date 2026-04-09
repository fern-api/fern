using SeedExhaustive;
using SeedExhaustive.Core;
using SeedExhaustive.Types;

namespace Usage;

public class Example28
{
    public async Task Do() {
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
