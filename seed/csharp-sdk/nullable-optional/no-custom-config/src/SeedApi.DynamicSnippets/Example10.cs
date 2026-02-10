using SeedNullableOptional;

namespace Usage;

public class Example10
{
    public async Task Do() {
        var client = new SeedNullableOptionalClient(
            clientOptions: new ClientOptions {
                BaseUrl = "https://api.fern.com"
            }
        );

        await client.NullableOptional.GetNotificationSettingsAsync(
            "userId"
        );
    }

}
