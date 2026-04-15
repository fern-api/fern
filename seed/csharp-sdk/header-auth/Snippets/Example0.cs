using SeedHeaderToken;

public partial class Examples
{
    public async Task Example0() {
        var client = new SeedHeaderTokenClient(
            headerTokenAuth: "<value>",
            clientOptions: new ClientOptions {
                BaseUrl = "https://api.fern.com"
            }
        );

        await client.Service.GetWithBearerTokenAsync();
    }

}
