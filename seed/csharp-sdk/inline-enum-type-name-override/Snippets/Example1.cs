using SeedApi;

public partial class Examples
{
    public async Task Example1() {
        var client = new SeedApiClient(
            clientOptions: new ClientOptions {
                BaseUrl = "https://api.fern.com"
            }
        );

        await client.Reporting.LoadAsync(
            new LoadRequest {
                Cache = LoadRequestCache.StaleIfSlow,
                Status = LoadRequestStatus.Active
            }
        );
    }

}
