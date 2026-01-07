using SeedCrossPackageTypeNames;

namespace SeedCrossPackageTypeNames.FolderA;

public partial interface IServiceClient
{
    Task<Response> GetDirectThreadAsync(
        RequestOptions? options = null,
        CancellationToken cancellationToken = default
    );
}
