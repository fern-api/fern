using SeedApi;

public partial class Examples
{
    public async Task Example13() {
        var client = new SeedApiClient(
            clientOptions: new ClientOptions {
                BaseUrl = "https://api.fern.com"
            }
        );

        await client.DataService.FetchAsync(
            new FetchRequest {
                Ids = new List<string>(){
                    "ids",
                }
                ,
                Namespace = "namespace"
            }
        );
    }

}
