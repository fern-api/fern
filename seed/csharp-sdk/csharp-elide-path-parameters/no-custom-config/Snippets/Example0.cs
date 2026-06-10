using SeedCsharpElidePathParameters;

public partial class Examples
{
    public async Task Example0() {
        var client = new SeedCsharpElidePathParametersClient(
            clientOptions: new ClientOptions {
                BaseUrl = "https://api.fern.com"
            }
        );

        await client.EndpointHeaders.GetEndpointHeadersPathParamAsync(
            new GetEndpointHeadersPathParamRequest {
                HeaderId = "header_id",
                XApiVersion = "X-API-Version"
            }
        );
    }

}
