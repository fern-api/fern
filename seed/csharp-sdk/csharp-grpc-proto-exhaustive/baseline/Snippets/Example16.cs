using SeedApi;

public partial class Examples
{
    public async Task Example16() {
        var client = new SeedApiClient(
            clientOptions: new ClientOptions {
                BaseUrl = "https://api.fern.com"
            }
        );

        await client.DataService.UpdateAsync(
            new UpdateRequest {
                Id = "id"
            }
        );
    }

}
