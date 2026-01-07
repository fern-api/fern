namespace SeedCsharpNamespaceConflict;

public partial interface ITasktestClient
{
    System.Threading.Tasks.Task HelloAsync(
        RequestOptions? options = null,
        CancellationToken cancellationToken = default
    );
}
