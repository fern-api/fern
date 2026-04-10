using SeedApi;

namespace Usage;

public class Example0
{
    public async Task Do() {
        var client = new SeedApiClient(
            clientOptions: new ClientOptions {
                BaseUrl = "https://api.fern.com"
            }
        );

        await client._.GetAccountAsync(
            new GetAccountRequest {
                AccountId = "account_id"
            }
        );
    }

}
