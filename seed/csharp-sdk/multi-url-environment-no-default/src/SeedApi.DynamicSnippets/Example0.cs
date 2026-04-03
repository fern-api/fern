using SeedMultiUrlEnvironmentNoDefault;

public partial class Examples
{
    public static async Task Example0()
    {
        var client = new SeedMultiUrlEnvironmentNoDefaultClient(
            token: "<token>"
        );

        await client.Ec2.BootInstanceAsync(
            new BootInstanceRequest {
                Size = "size"
            }
        );
    }

}
