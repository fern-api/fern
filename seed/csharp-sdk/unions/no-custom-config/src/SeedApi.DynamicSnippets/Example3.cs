using SeedUnions;
using System.Threading.Tasks;

namespace Usage;

public class Example3
{
    public async Task Do() {
        var client = new SeedUnionsClient(
            clientOptions: new ClientOptions{
                BaseUrl = "https://api.fern.com"
            }
        );

        await client.Bigunion.GetAsync(
            "id"
        );
    }

}
