using SeedApi;

public partial class Examples
{
    public async Task Example102() {
        var client = new SeedApiClient(
            token: "<token>",
            clientOptions: new ClientOptions {
                BaseUrl = "https://api.fern.com"
            }
        );

        await client.Endpoints.Urls.WithMixedCaseAsync();
    }

}
