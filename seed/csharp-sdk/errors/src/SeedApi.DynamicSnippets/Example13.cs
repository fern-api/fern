using SeedErrors;
using System.Threading.Tasks;

namespace Usage;

public class Example13
{
    public async Task Do() {
        var client = new SeedErrorsClient(
            clientOptions: new ClientOptions{
                BaseUrl = "https://api.fern.com"
            }
        );

        await client.Simple.FooWithExamplesAsync(
            new FooRequest{
                Bar = "bar"
            }
        );
    }

}
