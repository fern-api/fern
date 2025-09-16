using SeedResponseProperty;
using System.Threading.Tasks;

namespace Usage;

public class Example5
{
    public async Task Do() {
        var client = new SeedResponsePropertyClient(
            clientOptions: new ClientOptions{
                BaseUrl = "https://api.fern.com"
            }
        );

        await client.Service.GetMovieAsync(
            "string"
        );
    }

}
