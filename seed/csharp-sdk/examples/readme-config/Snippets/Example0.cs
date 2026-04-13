using SeedApi;

public partial class Examples
{
    public async Task Example0() {
        var client = new SeedExamplesClient(
            token: "<token>",
            clientOptions: new ClientOptions {
                BaseUrl = "https://api.fern.com"
            }
        );

        await client.FileNotificationService.FileNotificationServiceGetExceptionAsync(
            new FileNotificationServiceGetExceptionRequest {
                NotificationId = "notificationId"
            }
        );
    }

}
