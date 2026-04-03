using SeedNoRetries;

public partial class Examples
{
    public async Task Example0() {
        var client = new SeedNoRetriesClient(
            clientOptions: new ClientOptions {
                BaseUrl = "https://api.fern.com"
            }
        );

        await client.Retries.GetUsersAsync();
    }

}
