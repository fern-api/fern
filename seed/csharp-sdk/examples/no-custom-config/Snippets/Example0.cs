using SeedExamples;

public partial class Examples
{
    public async Task Example0() {
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
