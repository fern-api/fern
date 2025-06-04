using global::System.Threading.Tasks;
using SeedExhaustive;

namespace Usage;

public class Example42
{
    public async global::System.Threading.Tasks.Task Do() {
        var client = new SeedExhaustiveClient(
            token: "<token>",
            clientOptions: new ClientOptions{
                BaseUrl = "https://api.fern.com"
            }
        );

        await client.NoReqBody.GetWithNoRequestBodyAsync();
    }

}
