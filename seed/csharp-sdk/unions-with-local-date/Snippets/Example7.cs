using SeedApi;

public partial class Examples
{
    public async Task Example7() {
        var client = new SeedUnionsClient(
            clientOptions: new ClientOptions {
                BaseUrl = "https://api.fern.com"
            }
        );

        await client.Types.GetAsync(
            new TypesGetRequest {
                Id = "id"
            }
        );
    }

}
