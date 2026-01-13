using SeedApi.A;
using SeedApi.Folder;

namespace SeedApi;

public partial interface ISeedApiClient
{
    public AClient A { get; }
    public FolderClient Folder { get; }
    Task FooAsync(RequestOptions? options = null, CancellationToken cancellationToken = default);
}
