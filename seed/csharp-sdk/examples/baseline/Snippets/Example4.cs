using SeedExamples;

public partial class Examples
{
    public async Task Example4() {
        var client = new SeedExamplesClient(
            token: "<token>",
            clientOptions: new ClientOptions {
                BaseUrl = "https://api.fern.com"
            }
        );

        await client.File.Notification.Service.GetExceptionAsync(
            "notificationId"
        );
    }

}
