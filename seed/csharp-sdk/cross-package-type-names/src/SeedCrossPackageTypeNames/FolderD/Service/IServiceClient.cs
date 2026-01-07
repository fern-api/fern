using SeedCrossPackageTypeNames;

namespace SeedCrossPackageTypeNames.FolderD;

public partial interface IServiceClient
{
    Task<Response> GetDirectThreadAsync(
        RequestOptions? options = null,
        CancellationToken cancellationToken = default
    );
}
