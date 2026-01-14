using SeedApi;

namespace SeedApi.Folder;

public partial interface IFolderClient
{
    public ServiceClient Service { get; }
    Task FooAsync(RequestOptions? options = null, CancellationToken cancellationToken = default);
}
