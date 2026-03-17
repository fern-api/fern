using Candid.Net;

namespace Usage;

public class Example4
{
    public async global::System.Threading.Tasks.Task Do() {
        var client = new Candid(
            clientOptions: new ClientOptions {
                BaseUrl = "https://api.fern.com"
            }
        );

        await client.System.GetUserAsync(
            "userId"
        );
    }

}
