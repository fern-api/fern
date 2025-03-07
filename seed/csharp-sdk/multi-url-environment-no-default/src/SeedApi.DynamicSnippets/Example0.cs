using global::System.Threading.Tasks;
using SeedMultiUrlEnvironmentNoDefault;
using SeedMultiUrlEnvironmentNoDefault.Core;

namespace Usage;

public class Example0
{
    public async global::System.Threading.Tasks.Task Do() {
        var client = new SeedMultiUrlEnvironmentNoDefaultClient(
            token: "<token>",
            clientOptions: new ClientOptions{
                Environment = "https://api.fern.com"
            }
        );

        await client.Ec2.BootInstanceAsync(
            new BootInstanceRequest{
                Size = "size"
            }
        );
    }

}
