using SeedClientSideParams;

public partial class Examples
{
    public async Task Example11() {
        var client = new SeedClientSideParamsClient(
            token: "<token>",
            clientOptions: new ClientOptions {
                BaseUrl = "https://api.fern.com"
            }
        );

        await client.Service.GetClientAsync(
            clientId: "clientId",
            request: new GetClientRequest {
                Fields = "fields",
                IncludeFields = true
            }
        );
    }

}
