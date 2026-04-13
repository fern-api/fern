using SeedApi;

public partial class Examples
{
    public async Task Example0() {
        var client = new SeedMultiUrlEnvironmentNoDefaultClient(
            token: "<token>"
        );

        await client.Ec2.BootinstanceAsync(
            new Ec2BootInstanceRequest {
                Size = "size"
            }
        );
    }

}
