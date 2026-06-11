namespace SeedMultiUrlEnvironmentNoDefault;

public partial interface IEc2Client
{
    WithRawResponseTask BootInstanceAsync(
        BootInstanceRequest request,
        RequestOptions? options = null,
        CancellationToken cancellationToken = default
    );
}
