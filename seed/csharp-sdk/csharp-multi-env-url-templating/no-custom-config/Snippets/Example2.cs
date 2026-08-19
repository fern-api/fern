using SeedApi;

public partial class Examples
{
    public async Task Example2() {
        var client = new SeedApiClient();

        await client.Core.ListThingsAsync();
    }

}
