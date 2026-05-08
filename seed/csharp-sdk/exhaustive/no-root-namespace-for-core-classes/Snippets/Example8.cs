using SeedApi;
using SeedApi.Core;

public partial class Examples
{
    public async Task Example8() {
        var client = new SeedApiClient(
            token: "<token>",
            clientOptions: new ClientOptions {
                BaseUrl = "https://api.fern.com"
            }
        );

        await client.NoReqBody.PostWithNoRequestBodyAsync();
    }

}
