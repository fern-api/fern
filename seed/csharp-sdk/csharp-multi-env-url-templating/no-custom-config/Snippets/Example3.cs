using SeedApi;

public partial class Examples
{
    public async Task Example3() {
        var client = new SeedApiClient();

        await client.Core.ListThingsAsync();
    }

}
