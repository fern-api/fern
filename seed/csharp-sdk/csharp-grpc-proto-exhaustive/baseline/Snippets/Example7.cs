using SeedApi;
using OneOf;
using System.Globalization;

public partial class Examples
{
    public async Task Example7() {
        var client = new SeedApiClient(
            clientOptions: new ClientOptions {
                BaseUrl = "https://api.fern.com"
            }
        );

        await client.DataService.DescribeAsync(
            new DescribeRequest {
                Filter = new Dictionary<string, OneOf<double, string, bool>>(){
                    ["filter"] = 1.1,
                }
                ,
                After = DateTime.Parse("2024-01-15T09:30:00Z", null, DateTimeStyles.AdjustToUniversal)
            }
        );
    }

}
