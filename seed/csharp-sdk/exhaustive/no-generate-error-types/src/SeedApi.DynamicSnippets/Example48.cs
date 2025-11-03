using SeedExhaustive;

namespace Usage;

public class Example48
{
    public async Task Do() {
        var client = new SeedExhaustiveClient(
            token: "<token>",
            clientOptions: new ClientOptions {
                BaseUrl = "https://api.fern.com"
            }
        );

        await client.NoReqBody.GetWithNoRequestBodyAsync();
    }

}
