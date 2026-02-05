using SeedCrossPackageTypeNames;

namespace SeedCrossPackageTypeNames.FolderA;

public partial interface IServiceClient
{
    WithRawResponseTask<Response> GetDirectThreadAsync(
        RequestOptions? options = null,
        CancellationToken cancellationToken = default
    );
}
