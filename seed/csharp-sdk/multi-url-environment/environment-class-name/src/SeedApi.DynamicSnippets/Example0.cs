using SeedMultiUrlEnvironment;
using System.Threading.Tasks;

namespace Usage;

public class Example0
{
    public async Task Do() {
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
