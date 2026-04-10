using SeedApi;
using System.Text;

namespace Usage;

public class Example2
{
    public async Task Do() {
        var client = new SeedApiClient(
            clientOptions: new ClientOptions {
                BaseUrl = "https://api.fern.com"
            }
        );

        await client.Service.JustfilewithoptionalqueryparamsAsync(
            new ServiceJustFileWithOptionalQueryParamsRequest {
                File = new FileParameter(){
                    Stream = new MemoryStream(Encoding.UTF8.GetBytes("[bytes]"))
                }
            }
        );
    }

}
