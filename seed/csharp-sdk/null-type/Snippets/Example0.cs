using SeedApi;

public partial class Examples
{
    public async Task Example0() {
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
