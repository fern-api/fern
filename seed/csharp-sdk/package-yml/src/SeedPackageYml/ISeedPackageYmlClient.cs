namespace SeedPackageYml;

public partial interface ISeedPackageYmlClient
{
    public ServiceClient Service { get; }
    WithRawResponseTask<string> EchoAsync(
        string id,
        EchoRequest request,
        RequestOptions? options = null,
        CancellationToken cancellationToken = default
    );
}
