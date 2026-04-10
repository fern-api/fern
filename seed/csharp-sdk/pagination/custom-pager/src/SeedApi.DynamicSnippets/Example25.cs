using SeedApi;

namespace Usage;

public class Example25
{
    public async Task Do() {
        var client = new SeedApiClient(
            token: "<token>",
            clientOptions: new ClientOptions {
                BaseUrl = "https://api.fern.com"
            }
        );

        await client.InlineUsersInlineUsers.InlineUsersInlineUsersListWithGlobalConfigAsync(
            new InlineUsersInlineUsersListWithGlobalConfigRequest {
                Offset = 1
            }
        );
    }

}
