using SeedApi.A;
using SeedApi.Folder;

namespace SeedApi;

public partial interface ISeedApiClient
{
    public IAClient A { get; }
    public IFolderClient Folder { get; }
    WithRawResponseTask FooAsync(
        RequestOptions? options = null,
        CancellationToken cancellationToken = default
    );
}
