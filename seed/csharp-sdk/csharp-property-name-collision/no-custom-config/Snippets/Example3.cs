using SeedApi;

public partial class Examples
{
    public async Task Example3() {
        var client = new SeedApiClient(
            clientOptions: new ClientOptions {
                BaseUrl = "https://api.fern.com"
            }
        );

        await client._.CreateActivityAsync(
            new Activity {
                Activity_ = "activity",
                Timestamp = "timestamp"
            }
        );
    }

}
