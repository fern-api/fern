using SeedExhaustive;
using SeedExhaustive.Core;
using System.Text;

namespace Usage;

public class Example37
{
    public async Task Do() {
        var client = new SeedExhaustiveClient(
            token: "<token>",
            clientOptions: new ClientOptions {
                BaseUrl = "https://api.fern.com"
            }
        );

        await client.Endpoints.Params.UploadWithPathAsync(
            "upload-path",
            new MemoryStream(Encoding.UTF8.GetBytes("[bytes]"))
        );
    }

}
