using SeedApi.A;
using SeedApi.Folder;

namespace SeedApi;

public partial interface ISeedApiClient
{
    public IAClient A { get; }
    public IFolderClient Folder { get; }
    Task FooAsync(RequestOptions? options = null, CancellationToken cancellationToken = default);
}
