using SeedExamples;

namespace Usage;

public class Example3
{
    public async Task Do() {
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
