using SeedApi;

public partial class Examples
{
    public async Task Example0() {
        var client = new SeedApiClient(
            clientOptions: new ClientOptions {
                BaseUrl = "https://api.fern.com"
            }
        );

        await client.SubmitFormDataAsync(
            new SubmitFormDataRequest {
                Username = "johndoe",
                Email = "john@example.com"
            }
        );
    }

}
