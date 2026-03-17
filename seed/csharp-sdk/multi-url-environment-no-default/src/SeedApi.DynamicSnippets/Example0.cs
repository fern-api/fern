using SeedMultiUrlEnvironmentNoDefault;

namespace Usage;

public class Example0
{
    public async Task Do() {
        var client = new SeedMultiUrlEnvironmentNoDefaultClient(
            clientOptions: new ClientOptions {
                Environment = SeedMultiUrlEnvironmentNoDefaultEnvironment.Production
            },
            token: "<token>"
        );

        await client.Ec2.BootInstanceAsync(
            new BootInstanceRequest {
                Size = "size"
            }
        );
    }

}
