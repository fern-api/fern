using global::System.Threading.Tasks;
using SeedLicense;
using SeedLicense.Core;

namespace Usage;

public class Example0
{
    public async global::System.Threading.Tasks.Task Do() {
        var client = new SeedLicenseClient(
            clientOptions: new ClientOptions{
                BaseUrl = "https://api.fern.com"
            }
        );

        await client.GetAsync();
    }

}
