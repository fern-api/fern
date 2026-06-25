using SeedExhaustive;
using SeedExhaustive.Endpoints.Params;
using SeedExhaustive.Types.Object;

public partial class Examples
{
    public async Task Example42() {
        var client = new SeedExhaustiveClient(
            token: "<token>",
            clientOptions: new ClientOptions {
                BaseUrl = "https://api.fern.com"
            }
        );

        await client.Endpoints.Params.CreateWithBodyAndQueryAsync(
            new CreateWithBodyAndQuery {
                Fields = "_fields",
                Body = new ObjectWithRequiredField {
                    String = "string"
                }
            }
        );
    }

}
