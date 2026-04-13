namespace SeedApi;

public partial interface IEc2Client
{
    Task BootinstanceAsync(
        Ec2BootInstanceRequest request,
        RequestOptions? options = null,
        CancellationToken cancellationToken = default
    );
}
