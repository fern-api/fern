using SeedApi;

namespace SeedApi.Folder;

public partial interface IFolderClient
{
    public IServiceClient Service { get; }
    Task FooAsync(RequestOptions? options = null, CancellationToken cancellationToken = default);
}
