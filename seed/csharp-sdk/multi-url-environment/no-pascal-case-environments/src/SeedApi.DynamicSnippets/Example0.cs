using global::System.Threading.Tasks;
using SeedMultiUrlEnvironment;

namespace Usage;

public class Example0
{
    public async global::System.Threading.Tasks.Task Do() {
        var client = new SeedMultiUrlEnvironmentClient(
            token: "<token>"
        );

        await client.Ec2.BootInstanceAsync(
            new BootInstanceRequest{
                Size = "size"
            }
        );
    }

}
