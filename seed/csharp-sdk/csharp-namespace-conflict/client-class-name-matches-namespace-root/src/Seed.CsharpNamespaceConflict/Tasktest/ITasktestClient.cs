namespace Seed.CsharpNamespaceConflict;

public partial interface ITasktestClient
{
    global::System.Threading.Tasks.Task HelloAsync(
        RequestOptions? options = null,
        CancellationToken cancellationToken = default
    );
}
