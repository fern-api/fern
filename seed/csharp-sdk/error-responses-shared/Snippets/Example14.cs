using SeedApi;
using SeedApi.Messages;

public partial class Examples
{
    public async Task Example14() {
        var client = new SeedApiClient(
            clientOptions: new ClientOptions {
                BaseUrl = "https://api.fern.com"
            }
        );

        await client.Messages.Messages.CreateMessageAsync(
            new Message {
                Sid = "sid",
                Body = "body"
            }
        );
    }

}
