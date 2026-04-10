using SeedApi;
using System.Text;

namespace Usage;

public class Example11
{
    public async Task Do() {
        var client = new SeedApiClient(
            clientOptions: new ClientOptions {
                BaseUrl = "https://api.fern.com"
            }
        );

        await client.Service.WithliteralandenumtypesAsync(
            new ServiceWithLiteralAndEnumTypesRequest {
                File = new FileParameter(){
                    Stream = new MemoryStream(Encoding.UTF8.GetBytes("[bytes]"))
                }
            }
        );
    }

}
