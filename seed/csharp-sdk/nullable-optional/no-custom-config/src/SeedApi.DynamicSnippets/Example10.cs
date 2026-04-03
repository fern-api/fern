using SeedNullableOptional;

public partial class Examples
{
    public static async Task Example10()
    {
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
