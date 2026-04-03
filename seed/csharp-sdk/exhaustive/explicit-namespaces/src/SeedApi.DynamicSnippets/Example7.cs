using SeedExhaustive;
using SeedExhaustive.Types.Object;

public partial class Examples
{
    public static async Task Example7()
    {
        var client = new SeedExhaustiveClient(
            token: "<token>",
            clientOptions: new ClientOptions {
                BaseUrl = "https://api.fern.com"
            }
        );

        await client.Endpoints.Container.GetAndReturnOptionalAsync(
            new ObjectWithRequiredField {
                String = "string"
            }
        );
    }

}
