using SeedApi;

namespace Usage;

public class Example1
{
    public async Task Do() {
        var client = new SeedApiClient(
            token: "<token>",
            clientOptions: new ClientOptions {
                BaseUrl = "https://api.fern.com"
            }
        );

        await client.Ec2.BootinstanceAsync(
            new Ec2BootInstanceRequest {
                Size = "size"
            }
        );
    }

}
