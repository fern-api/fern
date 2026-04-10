namespace SeedMultiUrlEnvironment;

public partial interface IEc2Client
{
    Task BootInstanceAsync(
        BootInstanceRequest request,
        RequestOptions? options = null,
        CancellationToken cancellationToken = default
    );
}
