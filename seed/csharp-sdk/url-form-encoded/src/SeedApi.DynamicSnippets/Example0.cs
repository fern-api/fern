using SeedApi;
using System.Threading.Tasks;

namespace Usage;

public class Example0
{
    public async Task Do() {
        var client = new SeedApiClient(
            clientOptions: new ClientOptions {
                BaseUrl = "https://api.fern.com"
            }
        );

        await client.SubmitFormDataAsync(
            new PostSubmitRequest {
                Username = "johndoe",
                Email = "john@example.com"
            }
        );
    }

}
