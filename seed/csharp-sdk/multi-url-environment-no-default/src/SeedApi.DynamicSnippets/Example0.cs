using global::System.Threading.Tasks;
using SeedMultiUrlEnvironmentNoDefault;

namespace Usage;

public class Example0
{
    public async global::System.Threading.Tasks.Task Do() {
        var client = new SeedMultiUrlEnvironmentNoDefaultClient(
            token: "<token>"
        );

        await client.Ec2.BootInstanceAsync(
            new BootInstanceRequest{
                Size = "size"
            }
        );
    }

}
