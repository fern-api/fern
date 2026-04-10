namespace SeedApi;

public partial interface IFolderClient
{
    Task FooAsync(RequestOptions? options = null, CancellationToken cancellationToken = default);
}
