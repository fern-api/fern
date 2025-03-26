using global::System.Threading.Tasks;
using SeedUnions;

namespace Usage;

public class Example0
{
    public async global::System.Threading.Tasks.Task Do() {
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
