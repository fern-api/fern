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

        await client.Conversations.OutboundCallAsync(
            new OutboundCallConversationsRequest {
                ToPhoneNumber = "to_phone_number"
            }
        );
    }

}
