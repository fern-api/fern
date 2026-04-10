using SeedApi;

namespace Usage;

public class Example21
{
    public async Task Do() {
        var client = new SeedApiClient(
            clientOptions: new ClientOptions {
                BaseUrl = "https://api.fern.com"
            }
        );

        await client.Nullableoptional.GetnotificationsettingsAsync(
            new NullableOptionalGetNotificationSettingsRequest {
                UserId = "userId"
            }
        );
    }

}
