using SeedExamples;

public partial class Examples
{
    public async Task Example3() {
        var client = new SeedExamplesClient(
            token: "<token>",
            clientOptions: new ClientOptions {
                BaseUrl = "https://api.fern.com"
            }
        );

        await client.File.Notification.Service.GetExceptionAsync(
            "notification-hsy129x"
        );
    }

}
