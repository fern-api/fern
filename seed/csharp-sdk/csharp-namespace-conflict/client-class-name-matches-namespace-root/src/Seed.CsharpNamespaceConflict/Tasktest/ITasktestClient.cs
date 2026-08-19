namespace Seed.CsharpNamespaceConflict;

public partial interface ITasktestClient
{
    WithRawResponseTask HelloAsync(
        RequestOptions? options = null,
        CancellationToken cancellationToken = default
    );
}
