using SeedCrossPackageTypeNames;

namespace SeedCrossPackageTypeNames.FolderD;

public partial interface IServiceClient
{
    WithRawResponseTask<Response> GetDirectThreadAsync(
        RequestOptions? options = null,
        CancellationToken cancellationToken = default
    );
}
