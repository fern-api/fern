using SeedExhaustive;
using SeedExhaustive.Types;

public partial class Examples
{
    public async Task Example26() {
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
