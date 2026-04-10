using SeedExhaustive;
using SeedExhaustive.Core;
using SeedExhaustive.Types;

namespace Usage;

public class Example26
{
    public async Task Do() {
        var client = new SeedExhaustiveClient(
            token: "<token>",
            clientOptions: new ClientOptions {
                BaseUrl = "https://api.fern.com"
            }
        );

        await client.Endpoints.Object.GetAndReturnWithMixedRequiredAndOptionalFieldsAsync(
            new ObjectWithMixedRequiredAndOptionalFields {
                RequiredString = "hello",
                RequiredInteger = 0,
                OptionalString = "world",
                RequiredLong = 0L
            }
        );
    }

}
