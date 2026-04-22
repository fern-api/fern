using SeedApi;
using OneOf;

public partial class Examples
{
    public async Task Example5() {
        var client = new SeedApiClient(
            clientOptions: new ClientOptions {
                BaseUrl = "https://api.fern.com"
            }
        );

        await client.DataService.DeleteAsync(
            new DeleteRequest {
                Ids = new List<string>(){
                    "ids",
                    "ids",
                }
                ,
                DeleteAll = true,
                Namespace = "namespace",
                Filter = new Dictionary<string, OneOf<double, string, bool>>(){
                    ["filter"] = 1.1,
                }

            }
        );
    }

}
