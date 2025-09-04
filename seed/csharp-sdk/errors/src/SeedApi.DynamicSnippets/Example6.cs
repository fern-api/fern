using global::System.Threading.Tasks;
using SeedErrors;

namespace Usage;

public class Example6
{
    public async global::System.Threading.Tasks.Task Do() {
        var client = new SeedErrorsClient(
            clientOptions: new ClientOptions{
                BaseUrl = "https://api.fern.com"
            }
        );

        await client.Simple.FooAsync(
            new FooRequest{
                Bar = "bar"
            }
        );
    }

}
