using global::System.Threading.Tasks;
using SeedApi;
using OneOf;
using System.Globalization;

namespace Usage;

public class Example7
{
    public async global::System.Threading.Tasks.Task Do() {
        var client = new SeedApiClient(
            clientOptions: new ClientOptions{
                BaseUrl = "https://api.fern.com"
            }
        );

        await client.Dataservice.DescribeAsync(
            new DescribeRequest{
                Filter = new Dictionary<string, OneOf<double, string, bool>>(){
                    ["filter"] = 1.1,
                },
                After = DateTime.Parse("2024-01-15T09:30:00Z", null, DateTimeStyles.AdjustToUniversal)
            }
        );
    }

}
