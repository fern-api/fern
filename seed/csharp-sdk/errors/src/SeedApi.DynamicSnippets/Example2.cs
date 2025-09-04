using global::System.Threading.Tasks;
using SeedErrors;

namespace Usage;

public class Example2
{
    public async global::System.Threading.Tasks.Task Do() {
        var client = new SeedErrorsClient(
            clientOptions: new ClientOptions{
                BaseUrl = "https://api.fern.com"
            }
        );

        await client.Simple.FooWithoutEndpointErrorAsync(
            new FooRequest{
                Bar = "bar"
            }
        );
    }

}
