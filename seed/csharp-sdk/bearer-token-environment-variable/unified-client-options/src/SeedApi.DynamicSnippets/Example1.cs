using SeedApi;

namespace Usage;

public class Example1
{
    public async Task Do() {
        var client = new SeedApiClient(
            clientOptions: new ClientOptions {
                Token = "<token>",
                BaseUrl = "https://api.fern.com"
            }
        );

        await client.Service.GetwithbearertokenAsync();
    }

}
