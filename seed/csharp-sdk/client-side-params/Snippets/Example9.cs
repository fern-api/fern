using SeedClientSideParams;

public partial class Examples
{
    public async Task Example9() {
        var client = new SeedClientSideParamsClient(
            token: "<token>",
            clientOptions: new ClientOptions {
                BaseUrl = "https://api.fern.com"
            }
        );

        await client.Service.GetConnectionAsync(
            "connectionId",
            new GetConnectionRequest {
                Fields = "fields"
            }
        );
    }

}
