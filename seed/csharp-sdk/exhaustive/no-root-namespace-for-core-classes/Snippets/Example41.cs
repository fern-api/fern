using SeedExhaustive;
using SeedExhaustive.Core;
using System.Text;

public partial class Examples
{
    public async Task Example41() {
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
