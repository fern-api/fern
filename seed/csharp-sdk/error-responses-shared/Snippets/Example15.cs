using SeedApi;
using SeedApi.Messages;

public partial class Examples
{
    public async Task Example15() {
        var client = new SeedApiClient(
            clientOptions: new ClientOptions {
                BaseUrl = "https://api.fern.com"
            }
        );

        await client.Messages.Messages.DeleteMessageAsync(
            new DeleteMessageRequest {
                Sid = "sid"
            }
        );
    }

}
