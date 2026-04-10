using SeedExamples;

namespace Usage;

public class Example0
{
    public async Task Do() {
        var client = new SeedExamplesClient(
            token: "<token>",
            clientOptions: new ClientOptions {
                BaseUrl = "https://api.fern.com"
            }
        );

        await client.EchoAsync(
            "Hello world!\\n\\nwith\\n\\tnewlines"
        );
    }

}
