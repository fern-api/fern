using SeedMultiUrlEnvironment;

public partial class Examples
{
    public static async Task Example0()
    {
        var client = new SeedMultiUrlEnvironmentClient(
            token: "<token>"
        );

        await client.Ec2.BootInstanceAsync(
            new BootInstanceRequest {
                Size = "size"
            }
        );
    }

}
