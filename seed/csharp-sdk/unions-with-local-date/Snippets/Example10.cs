using SeedApi;

public partial class Examples
{
    public async Task Example10() {
        var client = new SeedUnionsClient(
            clientOptions: new ClientOptions {
                BaseUrl = "https://api.fern.com"
            }
        );

        await client.Union.GetAsync(
            new UnionGetRequest {
                Id = "id"
            }
        );
    }

}
